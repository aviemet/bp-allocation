import { Meteor } from 'meteor/meteor';

import { Members, MemberThemes } from '/imports/api/db';
import { registerObserver } from '../methods';

let once = true;

const membersObserver = registerObserver((doc, params) => {
	doc.theme = MemberThemes.findOne({ member: doc._id, theme: params.themeId });

	if(once) {
		console.log({ doc, params });
		once = false;
	}

	return doc;
});

// MemberThemes - Member activity for theme
Meteor.publish('memberThemes', (themeId) => {
	if(!themeId) return MemberThemes.find({});
	return MemberThemes.find({ theme: themeId });
});

// All members for the theme
Meteor.publish('members', function(themeId) {
	const memberThemes = MemberThemes.find({ theme: themeId }).fetch();
	const memberIds = memberThemes.map(memberTheme => memberTheme.member);
	
	const observer = Members.find({ _id: { $in: memberIds } }).observe(membersObserver('members', this, { themeId }));
	this.onStop(() => observer.stop());
	this.ready();
});

// Members - All members by [id]
Meteor.publish('membersById', (ids) => {
	if(!ids) return Members.find({});
	return Members.find({ _id: { $in: ids } });
});