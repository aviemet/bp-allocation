import { Meteor } from "meteor/meteor"

import { PresentationSettings, Themes } from "/imports/api/db"

Meteor.publish("settings", async function(themeId: string) {
	if(!themeId) {
		this.ready()
		return
	}

	const theme = await Themes.findOneAsync({ _id: themeId })
	if(!theme || !theme.presentationSettings) {
		this.ready()
		return
	}

	return PresentationSettings.find({ _id: theme.presentationSettings })
})
