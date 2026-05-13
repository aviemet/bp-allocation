import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"

import { Members, MemberThemes, type MemberData } from "/imports/api/db"
import { LogModels } from "/imports/api/db/Logs"
import { publicationLog } from "/imports/lib/loggers"
import { MemberTransformer } from "/imports/server/transformers"
import { registerObserver, type PublishSelf } from "../methods"
import { registerMemberThemesRefreshListener } from "/imports/server/publications/memberThemesRefreshCoordinator"
import { type MemberTheme } from "/imports/types/schema"

interface MembersTransformerParams {
	memberThemeByMemberId: Map<string, MemberTheme>
}

function buildMemberThemeLookupMap(rows: MemberTheme[], themeId: string): Map<string, MemberTheme> {
	const lookup = new Map<string, MemberTheme>()
	for(const row of rows) {
		if(row.theme === themeId && row.member) {
			lookup.set(row.member, row)
		}
	}
	return lookup
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
	const members = await Members.find({ _id: { $in: memberIds } }, subOptions).fetchAsync()
	members.forEach(member => {
		membersTransformerCallbacks.added(member)
	})

	const membersObserver = Members.find({ _id: { $in: memberIds } }, subOptions).observe(membersTransformerCallbacks)

	const refreshMembersFromMemberThemes = async (freshMemberThemes: MemberTheme[]) => {
		try {
			memberThemes = freshMemberThemes
			membersParams.memberThemeByMemberId = buildMemberThemeLookupMap(memberThemes, themeId)
			const updatedMemberIds = memberThemes
				.map(memberTheme => memberTheme.member)
				.filter((memberId): memberId is string => typeof memberId === "string")

			const membersList = await Members.find({ _id: { $in: updatedMemberIds } }, subOptions).fetchAsync()
			membersList.forEach(member => {
				const transformed = MemberTransformer(member, membersParams.memberThemeByMemberId.get(member._id))
				publisher.changed("members", member._id, transformed)
			})
		} catch (error) {
			publicationLog.error(
				"members.refresh",
				"Failed to refresh members publication after memberThemes coordinator update",
				error,
				{ themeId, model: LogModels.Member, mirrorToConsole: true },
			)
		}
	}

	const unsubscribeMemberThemes = registerMemberThemesRefreshListener(themeId, freshRows => {
		void refreshMembersFromMemberThemes(freshRows)
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
	const membersParams: MembersTransformerParams = {
		memberThemeByMemberId: buildMemberThemeLookupMap(
			await MemberThemes.find({ member: memberId, theme: themeId }).fetchAsync(),
			themeId,
		),
	}
	const membersTransformerCallbacks = membersTransformer("members", this, membersParams)

	const member = await Members.findOneAsync({ _id: memberId })
	if(member) {
		membersTransformerCallbacks.added(member)
	}

	const memberObserver = Members.find({ _id: memberId }).observe(membersTransformerCallbacks)

	const refreshMemberFromMemberThemes = async (freshMemberThemes: MemberTheme[]) => {
		try {
			membersParams.memberThemeByMemberId = buildMemberThemeLookupMap(freshMemberThemes, themeId)
			const memberDoc = await Members.findOneAsync({ _id: memberId })
			if(!memberDoc) return
			const transformed = MemberTransformer(memberDoc, membersParams.memberThemeByMemberId.get(memberDoc._id))
			this.changed("members", memberDoc._id, transformed)
		} catch (error) {
			publicationLog.error(
				"member.refresh",
				"Failed to refresh single-member publication after memberThemes coordinator update",
				error,
				{ themeId, model: LogModels.Member, mirrorToConsole: true, meta: { memberId } },
			)
		}
	}

	const unsubscribeMemberThemes = registerMemberThemesRefreshListener(themeId, freshRows => {
		void refreshMemberFromMemberThemes(freshRows)
	})

	this.onStop(() => {
		unsubscribeMemberThemes()
		if(memberObserver && typeof memberObserver.stop === "function") {
			memberObserver.stop()
		}
	})

	this.ready()
})
