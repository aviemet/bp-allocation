import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"

import { Members, MemberThemes, type MemberData } from "/imports/api/db"
import { MemberTransformer } from "/imports/server/transformers"
import { registerObserver, type PublishSelf } from "../methods"
import { type MemberTheme } from "/imports/types/schema"

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

	const memberThemes = await MemberThemes.find({ theme: themeId }).fetchAsync()
	const memberIds = memberThemes
		.map(memberTheme => memberTheme.member)
		.filter((memberId): memberId is string => typeof memberId === "string")

	const membersObserver = Members.find({ _id: { $in: memberIds } }, subOptions).observe(membersTransformer("members", publisher, { themeId, memberThemes }))

	publisher.onStop(() => {
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
	const memberThemes = await MemberThemes.find({ member: memberId, theme: themeId }).fetchAsync()
	const memberObserver = Members.find({ _id: memberId }).observe(membersTransformer("members", this, { themeId, memberThemes }))

	this.onStop(() => memberObserver.stop())

	this.ready()
})
