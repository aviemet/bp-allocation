import { Meteor } from "meteor/meteor"
import { Tracker } from "meteor/tracker"

import { registerObserver } from "../methods"
import { filterTopOrgs } from "/imports/lib/orgsMethods"

import { Themes, PresentationSettings, Organizations, MemberThemes, type ThemeData } from "/imports/api/db"
import { initializeThemeData } from "/imports/api/stores/ThemeStore"
import { ThemeTransformer, OrgTransformer } from "/imports/server/transformers"
import { type ThemeTransformerParams } from "/imports/server/transformers/themeTransformer"

const themeObserver = registerObserver((doc: ThemeData, params: ThemeTransformerParams) => {
	const transformed = ThemeTransformer(doc, params)
	return { ...transformed }
})

Meteor.publish("themes", function(themeId?: string) {
	if(themeId) {
		const observer = Themes.find({ _id: themeId }).observe({
			added: (doc) => this.added("themes", doc._id, { ...doc }),
			changed: (doc) => this.changed("themes", doc._id, { ...doc }),
			removed: (doc) => this.removed("themes", doc._id),
		})
		this.onStop(() => observer.stop())
		this.ready()
	} else {
		return Themes.find({}, { fields: { _id: 1, title: 1, createdAt: 1, slug: 1 } })
	}
})


Meteor.publish("theme", async function(themeId: string) {
	if(!themeId) {
		this.ready()
		return
	}

	const themeDoc = await Themes.findOneAsync({ _id: themeId })
	if(!themeDoc) {
		this.ready()
		return
	}
	const theme = initializeThemeData(themeDoc)

	const computation = Tracker.autorun(async () => {
		try {
			const settings = await PresentationSettings.findOneAsync({ _id: theme.presentationSettings })
			if(!settings) {
				this.ready()
				return
			}

			const memberThemes = await MemberThemes.find({ theme: theme._id }).fetchAsync()
			const orgs = await Organizations.find({ theme: theme._id }).fetchAsync()

			const transformedOrgs = orgs.map(org => {
				return OrgTransformer(org, { theme, settings, memberThemes })
			})

			const topOrgs = filterTopOrgs(transformedOrgs, theme)

			const observer = Themes.find({ _id: theme._id }).observe(themeObserver("themes", this, { topOrgs, memberThemes, settings }))
			this.onStop(() => {
				if(observer && typeof observer.stop === "function") {
					observer.stop()
				}
			})
			this.ready()
		} catch (error) {
			this.error(error instanceof Error ? error : new Error(String(error)))
		}
	})

	this.onStop(() => computation.stop())
})

Meteor.publish("themeBySlug", async function(slug: string) {
	if(!slug) {
		this.ready()
		return
	}

	const themeDoc = await Themes.findOneAsync({ slug })
	if(!themeDoc) {
		this.ready()
		return
	}
	const theme = initializeThemeData(themeDoc)

	const computation = Tracker.autorun(async () => {
		try {
			const settings = await PresentationSettings.findOneAsync({ _id: theme.presentationSettings })
			if(!settings) {
				this.ready()
				return
			}

			const memberThemes = await MemberThemes.find({ theme: theme._id }).fetchAsync()
			const orgs = await Organizations.find({ theme: theme._id }).fetchAsync()

			const transformedOrgs = orgs.map(org => {
				return OrgTransformer(org, { theme, settings, memberThemes })
			})

			const topOrgs = filterTopOrgs(transformedOrgs, theme)

			const observer = Themes.find({ _id: theme._id }).observe(themeObserver("themes", this, { topOrgs, memberThemes, settings }))
			this.onStop(() => {
				if(observer && typeof observer.stop === "function") {
					observer.stop()
				}
			})
			this.ready()
		} catch (error) {
			this.error(error instanceof Error ? error : new Error(String(error)))
		}
	})

	this.onStop(() => computation.stop())
})
