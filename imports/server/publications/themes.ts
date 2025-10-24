import { Meteor } from "meteor/meteor"

import { registerObserver } from "../methods"
import { filterTopOrgs } from "/imports/lib/orgsMethods"

import { Themes, PresentationSettings, Organizations, MemberThemes } from "/imports/api/db"
import { ThemeTransformer, OrgTransformer } from "/imports/server/transformers"

const themeObserver = registerObserver((doc, params) => {
	return ThemeTransformer(doc, params)
})

const themeObserverAutorun = (theme, publisher) => {
	publisher.autorun(async function() {
		try {
			const settings = await PresentationSettings.findOneAsync({ _id: theme.presentationSettings })
			const memberThemes = await MemberThemes.find({ theme: theme._id }).fetchAsync()
			const orgs = await Organizations.find({ theme: theme._id }).fetchAsync()

			const transformedOrgs = orgs.map(org => {
				try {
					return OrgTransformer(org, { theme, settings, memberThemes })
				} catch(error) {
					console.error("Error in OrgTransformer:", error, org)
					throw error
				}
			})

			const topOrgs = filterTopOrgs(transformedOrgs, theme)

			const observer = Themes.find({ _id: theme._id }).observe(themeObserver("themes", this, { topOrgs, memberThemes, settings }))
			this.onStop(() => {
				if(observer && typeof observer.stop === "function") {
					observer.stop()
				}
			})
			this.ready()
		} catch(error) {
			console.error("Error in themeObserverAutorun:", error)
			this.error(error)
		}
	})
}

Meteor.publish("themes", function(themeId) {
	if(themeId) {
		const observer = Themes.find({ _id: themeId }).observe(themeObserver("themes", this))
		this.onStop(() => observer.stop())
		this.ready()
	} else {
		return Themes.find({}, { fields: { _id: 1, title: 1, createdAt: 1, slug: 1 } })
	}
})


Meteor.publish("theme", async function(themeId) {
	if(!themeId) return

	const theme = await Themes.findOneAsync({ _id: themeId })
	if(!theme) {
		return
	}

	themeObserverAutorun(theme, this)
})

Meteor.publish("themeBySlug", async function(slug) {
	if(!slug) return

	const theme = await Themes.findOneAsync({ slug })
	if(!theme) {
		return
	}

	themeObserverAutorun(theme, this)
})
