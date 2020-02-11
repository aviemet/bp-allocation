import { Meteor } from 'meteor/meteor';

import { Members, MemberThemes } from '/imports/api/db';

// MemberThemes - Member activity for theme
Meteor.publish('memberThemes', (themeId) => {
	if(!themeId) return MemberThemes.find({});
	return MemberThemes.find({ theme: themeId });
});

// Members - All members by [id]
Meteor.publish('members', (ids) => {
	if(!ids) return Members.find({});
	return Members.find({ _id: { $in: ids } });
});