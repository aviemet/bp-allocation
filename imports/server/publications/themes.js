import { Meteor } from 'meteor/meteor';

import { Themes } from '/imports/api';

Meteor.publish('themes', (themeId) => {
	if(themeId){
		return Themes.find({ _id: themeId });
	}
	return Themes.find({}, { fields: { _id: 1, title: 1, createdAt: 1, slug: 1 }});
});