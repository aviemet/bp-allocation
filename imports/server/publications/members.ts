import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"

import { Members, MemberThemes, type MemberData } from "/imports/api/db"
import { MemberTransformer } from "/imports/server/transformers"
import { registerObserver, type PublishSelf } from "../methods"
import { type MemberTheme } from "/imports/types/schema"
import { createDebouncedFunction } from "/imports/lib/utils"

interface MembersTransformerParams {
	themeId: string
	memberThemes: MemberTheme[]
}

const membersTransformer = registerObserver((doc: MemberData, params: MembersTransformerParams) => {
	const memberTheme = params.memberThemes.find(theme => theme.member === doc._id && theme.theme === params.themeId)
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

	const membersTransformerCallbacks = membersTransformer("members", publisher, { themeId, memberThemes })
	const members = await Members.find({ _id: { $in: memberIds } }, subOptions).fetchAsync()
	members.forEach(member => {
		membersTransformerCallbacks.added(member)
	})

	const membersObserver = Members.find({ _id: { $in: memberIds } }, subOptions).observe(membersTransformerCallbacks)

	const refreshMembersFromMemberThemes = async () => {
		try {
			memberThemes = await MemberThemes.find({ theme: themeId }).fetchAsync()
			const updatedMemberIds = memberThemes
				.map(memberTheme => memberTheme.member)
				.filter((memberId): memberId is string => typeof memberId === "string")

			const members = await Members.find({ _id: { $in: updatedMemberIds } }, subOptions).fetchAsync()
			members.forEach(member => {
				const transformed = MemberTransformer(member, memberThemes.find(theme => theme.member === member._id && theme.theme === themeId))
				publisher.changed("members", member._id, transformed)
			})
		} catch (_error) {
			// Error refreshing members from memberThemes
		}
	}

	const debouncedRefresh = createDebouncedFunction(refreshMembersFromMemberThemes, 100)

	const memberThemesWatcher = MemberThemes.find({ theme: themeId }).observeChanges({
		added: () => {
			debouncedRefresh()
		},
		changed: () => {
			debouncedRefresh()
		},
		removed: () => {
			debouncedRefresh()
		},
	})

	publisher.onStop(() => {
		debouncedRefresh.cancel()
		if(membersObserver && typeof membersObserver.stop === "function") {
			membersObserver.stop()
		}
		if(memberThemesWatcher && typeof memberThemesWatcher.stop === "function") {
			memberThemesWatcher.stop()
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
	const memberThemes = await MemberThemes.find({ member: memberId, theme: themeId }).fetchAsync()
	const membersTransformerCallbacks = membersTransformer("members", this, { themeId, memberThemes })

	const member = await Members.findOneAsync({ _id: memberId })
	if(member) {
		membersTransformerCallbacks.added(member)
	}

	const memberObserver = Members.find({ _id: memberId }).observe(membersTransformerCallbacks)

	this.onStop(() => memberObserver.stop())

	this.ready()
})
