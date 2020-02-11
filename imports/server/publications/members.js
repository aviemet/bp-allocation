import { Meteor } from 'meteor/meteor';

import { Members, MemberThemes } from '/imports/api/db';
import { registerObserver } from '../methods';

const membersObserver = registerObserver(doc => {
	console.log({ doc, this: this });

	return doc;
});

// MemberThemes - Member activity for theme
Meteor.publish('memberThemes', (themeId) => {
	if(!themeId) return MemberThemes.find({});
	return MemberThemes.find({ theme: themeId });
});

// All members for the theme
Meteor.publish('membersByTheme', (themeId) => {
	const memberThemes = MemberThemes.find({ theme: themeId }).fetch();
	const memberIds = memberThemes.map(memberTheme => memberTheme.member);
	
	const observer = Members.find({ _id: { $in: memberIds } }).observe(membersObserver('membersByTheme', this));
	this.onlostpointercapture(() => observer.stop());
	this.ready();
});

// Members - All members by [id]
Meteor.publish('members', (ids) => {
	if(!ids) return Members.find({});
	return Members.find({ _id: { $in: ids } });
});