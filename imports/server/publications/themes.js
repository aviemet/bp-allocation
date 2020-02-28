import { Meteor } from 'meteor/meteor';
import { registerObserver } from '../methods';
import { filterTopOrgs } from '/imports/lib/orgsMethods';

import { Themes, PresentationSettings, Organizations, MemberThemes } from '/imports/api/db';
import { ThemeTransformer, OrgTransformer } from '/imports/server/transformers';

const themeObserver = registerObserver(doc => {
	const settings = PresentationSettings.findOne({ _id: doc.presentationSettings });
	const memberThemes = MemberThemes.find({ theme: doc._id }).fetch();
	const orgs = Organizations.find({ theme: doc._id }).fetch().map(org => OrgTransformer(org, doc, settings, memberThemes));
	const topOrgs = filterTopOrgs(orgs, doc);

	return ThemeTransformer(doc, { topOrgs, memberThemes, settings });
});

Meteor.publish('themes', function(themeId) {
	if(themeId) {
		const observer = Themes.find({ _id: themeId }).observe(themeObserver('themes', this));
		this.onStop(() => observer.stop());
		this.ready();
	} else {
		return Themes.find({}, { fields: { _id: 1, title: 1, createdAt: 1, slug: 1 } });
	}
});

Meteor.publish('theme', function(themeId) {
	if(!themeId) return;

	const theme = Themes.findOne({ _id: themeId });

	this.autorun(function() {
		const settings = PresentationSettings.findOne({ _id: theme.presentationSettings });
		const memberThemes = MemberThemes.find({ theme: themeId }).fetch();

		const orgs = Organizations.find({ theme: themeId }).fetch().map(org => OrgTransformer(org, { theme, settings, memberThemes }));

		const topOrgs = filterTopOrgs(orgs, theme);

		const observer = Themes.find({ _id: themeId }).observe(themeObserver('themes', this, { topOrgs, memberThemes, settings }));
		this.onStop(() => observer.stop());
		this.ready();
	});
});