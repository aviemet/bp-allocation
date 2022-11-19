import { Meteor, type Subscription } from 'meteor/meteor'
import { registerObserver } from '../methods'
import { filterTopOrgs } from '/imports/lib/orgsMethods'

import { Themes, PresentationSettings, Organizations, MemberThemes } from '/imports/api/db'
import { ThemeTransformer, OrgTransformer } from '/imports/server/transformers'
import { type ThemeTransformerParams } from '/imports/server/transformers/themeTransformer'

const themeObserver = registerObserver((doc: Theme, params: ThemeTransformerParams) => {
	return ThemeTransformer(doc, params)
})

const themeObserverAutorun = (theme: Theme, publisher: Subscription) => {
	publisher.autorun(function() {
		const settings = PresentationSettings.findOne({ _id: theme.presentationSettings })
		const memberThemes = MemberThemes.find({ theme: theme._id }).fetch()

		if(!settings) return

		const orgs = Organizations.find({ theme: theme._id }).fetch().map(org => OrgTransformer(org, { theme, settings, memberThemes }))

		const topOrgs = filterTopOrgs(orgs, theme)

		const themes = Themes.find({ _id: theme._id })
		const observer = themes.observe(themeObserver('themes', this, { topOrgs, memberThemes, settings }))
		this.onStop(() => observer.stop())
		this.ready()
	})
}

Meteor.publish('themes', function(themeId) {
	if(themeId) {
		const themes = Themes.find({ _id: themeId })
		const observer = themes.observe(themeObserver('themes', this))

		this.onStop(() => observer.stop())
		this.ready()
	} else {
		return Themes.find({}, { fields: { _id: 1, title: 1, createdAt: 1, slug: 1 } })
	}
})


Meteor.publish('theme', function(themeId) {
	if(!themeId) return

	const theme = Themes.findOne({ _id: themeId })
	if(!theme) return

	themeObserverAutorun(theme, this)
})

Meteor.publish('themeBySlug', function(slug) {
	if(!slug) return

	const theme = Themes.findOne({ slug })
	if(!theme) return

	themeObserverAutorun(theme, this)
})
