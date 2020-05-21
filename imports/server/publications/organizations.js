import { Meteor } from 'meteor/meteor'
import { registerObserver } from '../methods'
import { OrgTransformer } from '/imports/server/transformers'

import { Organizations, Themes, MemberThemes, PresentationSettings } from '/imports/api/db'

const orgObserver = registerObserver((doc, params) => {
	if(!doc.theme) return doc

	return OrgTransformer(doc, params)
})

// Organizations - All orgs for theme
Meteor.publish('organizations', function(themeId) {
	if(!themeId) return null

	// Autorun recalculates enclosed document searches with any change on related data
	this.autorun(function() {
		const theme = Themes.findOne({ _id: themeId })
		const settings = PresentationSettings.findOne({ _id: theme.presentationSettings })
		const memberThemes = MemberThemes.find({ theme: themeId }).fetch()

		const orgsObserver = Organizations.find({ theme: themeId }).observe(orgObserver('organizations', this, { theme, settings, memberThemes } ))
	
		this.onStop(() => orgsObserver.stop())
		this.ready()
	})
})

/*
// TopOrgs - Top voted orgs from first round of voting
Meteor.publish('topOrgs', function(themeId) {
	if(!themeId) return null
	// TODO: Filter by top chit votes
	const observer = Organizations.find({ theme: themeId }).observe(orgObserver('organizations', this))
	this.onStop(() => observer.stop())
	this.ready()
})

// Organization - Single org
Meteor.publish('organization', function(orgId) {
	if(!orgId) return null

	const observer = Organizations.find({ _id: orgId }).observe(orgObserver('organization', this))
	this.onStop(() => observer.stop())
	this.ready()
})
*/