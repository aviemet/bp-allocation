import { Meteor } from "meteor/meteor"

import { Members, MemberThemes } from "/imports/api/db"
import { MemberTransformer } from "/imports/server/transformers"
import { registerObserver } from "../methods"

const membersTransformer = registerObserver((doc, params) => {
	const memberTheme = MemberThemes.findOne({ member: doc._id, theme: params.themeId })

	return MemberTransformer(doc, memberTheme)
})

// MemberThemes - Member activity for theme
Meteor.publish("memberThemes", (themeId) => {
	if(!themeId) return MemberThemes.find({})
	return MemberThemes.find({ theme: themeId })
})

// limit of 0 == 'return no records', limit of false == 'no limit'
Meteor.publish("members", function({ themeId, limit }) {
	if(limit === 0) {
		this.ready()
		return
	}

	const subOptions = { sort: { number: 1 } }
	if(limit !== false) {
		subOptions.limit = limit
	}

	this.autorun(function() {
		const memberThemes = MemberThemes.find({ theme: themeId }).fetch()
		const memberIds = memberThemes.map(memberTheme => memberTheme.member)

		const membersObserver = Members.find({ _id: { $in: memberIds } }, subOptions).observe(membersTransformer("members", this, { themeId }))
		this.onStop(() => membersObserver.stop())
		this.ready()
	})
})

Meteor.publish("member", function({ memberId, themeId }) {
	if(!memberId) {
		this.ready()
		return
	}

	const memberObserver = Members.find({ _id: memberId }).observe(membersTransformer("members", this, { themeId, debug: true }))

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
