import { Meteor } from 'meteor/meteor';

import { PresentationSettings } from '/imports/api';

Meteor.publish('presentationSettings', (settingsId) => {
	try{
		return PresentationSettings.find({ _id: settingsId });
	} catch(e) {
		console.error('Specify an ID to fetch presentation settings');
	}
});