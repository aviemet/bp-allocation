import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"

import { Members, MemberThemes, type MemberData } from "/imports/api/db"
import { LogModels } from "/imports/api/db/Logs"
import { publicationLog } from "/imports/lib/logging"
import { MemberTransformer } from "/imports/server/transformers"
import { registerObserver, type PublishSelf } from "../methods"
import {
	findMemberThemeForMember,
	memberThemeContentSignature,
} from "/imports/server/publications/memberThemeChange"
import { registerMemberThemesRefreshListener } from "/imports/server/publications/memberThemesRefreshCoordinator"
import {
	applyMembersPublicationRefreshPlan,
	planMembersPublicationRefresh,
} from "/imports/server/publications/membersPublicationSync"
import { createCoalescedRefresh } from "/imports/server/publications/publicationRefreshCoalesce"
import {
	recordPublicationChangedEmissions,
	recordPublicationRefreshTrigger,
	trackPublicationRefresh,
} from "/imports/server/publications/publicationRefreshMetrics"
import { buildMemberThemeLookupMap } from "/imports/server/themeDataLoaders/memberThemeLookup"
import { type MemberTheme } from "/imports/types/schema"

interface MembersTransformerParams {
	memberThemeByMemberId: Map<string, MemberTheme>
}

const membersTransformer = registerObserver((doc: MemberData, params: MembersTransformerParams) => {
	const memberTheme = params.memberThemeByMemberId.get(doc._id)
	return MemberTransformer(doc, memberTheme)
})

Meteor.publish("memberThemes", (themeId?: string) => {
	if(!themeId) return MemberThemes.find({})

	return MemberThemes.find({ theme: themeId })
})

const publishMembers = async (themeId: string, limit: number | false, publisher: PublishSelf) => {
	const subOptions: { sort: Mongo.SortSpecifier, limit?: number } = { sort: { number: 1 } }
	if(limit !== false) {
		subOptions.limit = limit
	}

	let memberThemes = await MemberThemes.find({ theme: themeId }).fetchAsync()
	const memberIds = memberThemes
		.map(memberTheme => memberTheme.member)
		.filter((memberId): memberId is string => typeof memberId === "string")

	const membersParams: MembersTransformerParams = {
		memberThemeByMemberId: buildMemberThemeLookupMap(memberThemes, themeId),
	}
	const membersTransformerCallbacks = membersTransformer("members", publisher, membersParams)
	const publishedMemberIds = new Set<string>()
	const members = await Members.find({ _id: { $in: memberIds } }, subOptions).fetchAsync()
	members.forEach(member => {
		membersTransformerCallbacks.added(member)
		publishedMemberIds.add(member._id)
	})

	const membersObserver = Members.find({ _id: { $in: memberIds } }, subOptions).observe(membersTransformerCallbacks)
	const coalescedRefresh = createCoalescedRefresh()
	let pendingMemberThemes = memberThemes

	const refreshMembersFromMemberThemes = async () => {
		recordPublicationRefreshTrigger("members.refresh")
		await trackPublicationRefresh("members.refresh", async () => {
			try {
				memberThemes = pendingMemberThemes
				membersParams.memberThemeByMemberId = buildMemberThemeLookupMap(memberThemes, themeId)
				const updatedMemberIds = memberThemes
					.map(memberTheme => memberTheme.member)
					.filter((memberId): memberId is string => typeof memberId === "string")

				const membersList = await Members.find({ _id: { $in: updatedMemberIds } }, subOptions).fetchAsync()
				const refreshPlan = planMembersPublicationRefresh(
					publishedMemberIds,
					membersList.map(member => member._id),
				)

				for(const memberId of refreshPlan.removed) {
					publisher.removed("members", memberId)
				}
				applyMembersPublicationRefreshPlan(publishedMemberIds, refreshPlan)

				const membersById = new Map(membersList.map(member => [member._id, member]))
				let changedEmissions = 0
				for(const memberId of refreshPlan.changed) {
					const member = membersById.get(memberId)
					if(!member) continue
					const transformed = MemberTransformer(member, membersParams.memberThemeByMemberId.get(member._id))
					publisher.changed("members", member._id, transformed)
					changedEmissions += 1
				}
				for(const memberId of refreshPlan.added) {
					const member = membersById.get(memberId)
					if(!member) continue
					const transformed = MemberTransformer(member, membersParams.memberThemeByMemberId.get(member._id))
					publisher.added("members", member._id, transformed)
					changedEmissions += 1
				}
				recordPublicationChangedEmissions("members.refresh", changedEmissions)
			} catch (error) {
				publicationLog.error(
					"members.refresh",
					"Failed to refresh members publication after memberThemes coordinator update",
					error,
					{ themeId, model: LogModels.Member, mirrorToConsole: true },
				)
			}
		})
	}

	const unsubscribeMemberThemes = registerMemberThemesRefreshListener(themeId, freshRows => {
		pendingMemberThemes = freshRows
		coalescedRefresh.schedule(() => refreshMembersFromMemberThemes())
	})

	publisher.onStop(() => {
		unsubscribeMemberThemes()
		if(membersObserver && typeof membersObserver.stop === "function") {
			membersObserver.stop()
		}
	})

	publisher.ready()
}

Meteor.publish("members", async function({ themeId, limit }: { themeId: string, limit: number | false }) {
	if(limit === 0) {
		this.ready()
		return
	}

	await publishMembers(themeId, limit, this)
})

Meteor.publish("member", async function({ memberId, themeId }: { memberId: string, themeId: string }) {
	const initialMemberThemes = await MemberThemes.find({ member: memberId, theme: themeId }).fetchAsync()
	const membersParams: MembersTransformerParams = {
		memberThemeByMemberId: buildMemberThemeLookupMap(initialMemberThemes, themeId),
	}
	const membersTransformerCallbacks = membersTransformer("members", this, membersParams)

	const member = await Members.findOneAsync({ _id: memberId })
	if(member) {
		membersTransformerCallbacks.added(member)
	}

	const memberObserver = Members.find({ _id: memberId }).observe(membersTransformerCallbacks)
	const coalescedRefresh = createCoalescedRefresh()
	let pendingMemberThemes = initialMemberThemes
	let lastPublishedSignature = memberThemeContentSignature(
		findMemberThemeForMember(initialMemberThemes, memberId, themeId),
	)

	const refreshMemberFromMemberThemes = async () => {
		recordPublicationRefreshTrigger("member.refresh")
		await trackPublicationRefresh("member.refresh", async () => {
			try {
				const memberTheme = findMemberThemeForMember(pendingMemberThemes, memberId, themeId)
				const nextSignature = memberThemeContentSignature(memberTheme)
				if(nextSignature === lastPublishedSignature) {
					return
				}
				membersParams.memberThemeByMemberId = buildMemberThemeLookupMap(
					memberTheme ? [memberTheme] : [],
					themeId,
				)
				const memberDoc = await Members.findOneAsync({ _id: memberId })
				if(!memberDoc) return
				const transformed = MemberTransformer(memberDoc, membersParams.memberThemeByMemberId.get(memberDoc._id))
				this.changed("members", memberDoc._id, transformed)
				lastPublishedSignature = nextSignature
				recordPublicationChangedEmissions("member.refresh", 1)
			} catch (error) {
				publicationLog.error(
					"member.refresh",
					"Failed to refresh single-member publication after memberThemes coordinator update",
					error,
					{ themeId, model: LogModels.Member, mirrorToConsole: true, meta: { memberId } },
				)
			}
		})
	}

	const unsubscribeMemberThemes = registerMemberThemesRefreshListener(themeId, freshRows => {
		pendingMemberThemes = freshRows
		const nextSignature = memberThemeContentSignature(
			findMemberThemeForMember(freshRows, memberId, themeId),
		)
		if(nextSignature === lastPublishedSignature) {
			return
		}
		coalescedRefresh.schedule(() => refreshMemberFromMemberThemes())
	})

	this.onStop(() => {
		unsubscribeMemberThemes()
		if(memberObserver && typeof memberObserver.stop === "function") {
			memberObserver.stop()
		}
	})

	this.ready()
})
