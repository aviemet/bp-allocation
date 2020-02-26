import { Meteor } from 'meteor/meteor';

import { Members, MemberThemes } from '/imports/api/db';
import { MemberTransformer } from '/imports/server/transformers';
import { registerObserver } from '../methods';

const membersTransformer = registerObserver((doc, params) => {
	const memberTheme = MemberThemes.findOne({ member: doc._id, theme: params.themeId });

	return MemberTransformer(doc, memberTheme);
});

// MemberThemes - Member activity for theme
Meteor.publish('memberThemes', (themeId) => {
	if(!themeId) return MemberThemes.find({});
	return MemberThemes.find({ theme: themeId });
});

// All members for the theme
Meteor.publish('members', function(themeId) {
	const memberThemesCursor = MemberThemes.find({ theme: themeId });
	const memberThemesObserver = memberThemesCursor.observe(doc => doc);
	const memberThemes = memberThemesCursor.fetch();
	const memberIds = memberThemes.map(memberTheme => memberTheme.member);
	
	const membersCursor = Members.find({ _id: { $in: memberIds } });
	const membersObserver = membersCursor.observe(membersTransformer('members', this, { themeId }));
	this.onStop(() => {
		membersObserver.stop();
		memberThemesObserver.stop();
	});
	this.ready();
});

// Members - All members by [id]
Meteor.publish('membersById', (ids) => {
	if(!ids) return Members.find({});
	return Members.find({ _id: { $in: ids } });
});