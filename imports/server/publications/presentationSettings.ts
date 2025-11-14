import { Meteor } from "meteor/meteor"

import { PresentationSettings, Themes } from "/imports/api/db"

Meteor.publish("settings", async function(themeId: string) {
	const theme = await Themes.findOneAsync({ _id: themeId })
	if(!theme || !theme.presentationSettings) {
		this.ready()
		return
	}

	const settings = await PresentationSettings.findOneAsync({ _id: theme.presentationSettings })
	if(settings) {
		this.added("presentationSettings", settings._id, settings as unknown as Record<string, unknown>)
	}

	const observer = PresentationSettings.find({ _id: theme.presentationSettings }).observe({
		added: (doc) => {
			this.added("presentationSettings", doc._id, doc as unknown as Record<string, unknown>)
		},
		changed: (doc) => {
			this.changed("presentationSettings", doc._id, doc as unknown as Record<string, unknown>)
		},
		removed: (doc) => {
			this.removed("presentationSettings", doc._id)
		},
	})

	this.onStop(() => {
		if(observer && typeof observer.stop === "function") {
			observer.stop()
		}
	})
	this.ready()
})
