import { Meteor } from 'meteor/meteor'

import { PresentationSettings, Themes } from '/imports/api/db'

/*
Meteor.publish('presentationSettings', (settingsId) => {
	try{
		return PresentationSettings.find({ _id: settingsId })
	} catch(e) {
		console.error('Specify an ID to fetch presentation settings')
	}
})
*/
Meteor.publish('settings', function(themeId) {
	const theme = Themes.findOne({ _id: themeId })
	try{
		return PresentationSettings.find({ _id: theme.presentationSettings })
	} catch(e) {
		console.error('Specify an ID to fetch presentation settings')
	}
})
