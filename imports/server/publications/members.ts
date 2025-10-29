import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import { Tracker } from "meteor/tracker"

import { Members, MemberThemes, type MemberData } from "/imports/api/db"
import { MemberTransformer } from "/imports/server/transformers"
import { registerObserver } from "../methods"

interface MembersTransformerParams {
	themeId: string
	debug?: boolean
}

const membersTransformer = registerObserver((doc: MemberData, params: MembersTransformerParams) => {
	const memberTheme = MemberThemes.findOne({ member: doc._id, theme: params.themeId })
	return MemberTransformer({ ...doc, theme: memberTheme }, memberTheme)
})

// MemberThemes - Member activity for theme
Meteor.publish("memberThemes", (themeId?: string) => {
	if(!themeId) return MemberThemes.find({})
	return MemberThemes.find({ theme: themeId })
})

// limit of 0 == 'return no records', limit of false == 'no limit'
Meteor.publish("members", function({ themeId, limit }: { themeId: string, limit: number | false }) {
	if(limit === 0) {
		this.ready()
		return
	}

	const subOptions: { sort: Mongo.SortSpecifier, limit?: number } = { sort: { number: 1 } }
	if(limit !== false) {
		subOptions.limit = limit
	}

	const computation = Tracker.autorun(() => {
		const memberThemes = MemberThemes.find({ theme: themeId }).fetch()
		const memberIds = memberThemes
			.map(mt => mt.member)
			.filter((id): id is string => typeof id === "string")

		const membersObserver: Meteor.LiveQueryHandle = Members.find({ _id: { $in: memberIds } }, subOptions).observe(membersTransformer("members", this, { themeId }))
		this.onStop(() => membersObserver.stop())
		this.ready()
	})

	this.onStop(() => computation.stop())
})

Meteor.publish("member", function({ memberId, themeId }: { memberId?: string, themeId: string }) {
	if(!memberId) {
		this.ready()
		return
	}

	const memberObserver: Meteor.LiveQueryHandle = Members.find({ _id: memberId }).observe(membersTransformer("members", this, { themeId, debug: true }))

	this.onStop(() => memberObserver.stop())
	this.ready()
})

/*
// All members for the theme
Meteor.publish('members', function(themeId) {
	const memberThemesCursor = MemberThemes.find({ theme: themeId })
	const memberThemesObserver = memberThemesCursor.observe(doc => doc)
	const memberThemes = memberThemesCursor.fetch()
	const memberIds = memberThemes.map(memberTheme => memberTheme.member)

	const membersCursor = Members.find({ _id: { $in: memberIds } })
	const membersObserver = membersCursor.observe(membersTransformer('members', this, { themeId }))
	this.onStop(() => {
		membersObserver.stop()
		memberThemesObserver.stop()
	})
	this.ready()
})
*/
