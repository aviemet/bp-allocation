import { Meteor } from "meteor/meteor"
import { Tracker } from "meteor/tracker"

import { registerObserver } from "../methods"
import { OrgTransformer } from "/imports/server/transformers"

import { Organizations, Themes, MemberThemes, PresentationSettings, type OrgData, type ThemeData, type SettingsData } from "/imports/api/db"
import { type MemberTheme } from "/imports/types/schema"

interface OrgObserverParams {
	theme?: ThemeData
	settings?: SettingsData
	memberThemes: MemberTheme[]
}

const orgObserver = registerObserver((doc: OrgData, params: OrgObserverParams) => {
	if(!doc.theme) return doc
	return OrgTransformer(doc, params)
})

// Organizations - All orgs for theme
Meteor.publish("organizations", function(themeId: string) {
	if(!themeId) {
		this.ready()
		return
	}

	const computation = Tracker.autorun(async() => {
		const theme = await Themes.findOneAsync({ _id: themeId })
		const settings = theme?.presentationSettings ?
			await PresentationSettings.findOneAsync({ _id: theme?.presentationSettings }) :
			undefined
		const memberThemes = await MemberThemes.find({ theme: themeId }).fetchAsync()

		const orgsObserver = Organizations.find({ theme: themeId }).observe(orgObserver("organizations", this, { theme, settings, memberThemes } ))

		this.onStop(() => {
			if(orgsObserver && typeof orgsObserver.stop === "function") {
				orgsObserver.stop()
			}
		})
		this.ready()
	})

	this.onStop(() => computation.stop())
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
