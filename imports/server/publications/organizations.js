import { Meteor } from 'meteor/meteor';
import { registerObserver } from '../methods';
import { OrgTransformer } from '/imports/server/transformers';

import { Organizations, Themes, MemberThemes, PresentationSettings } from '/imports/api/db';

const aggregate = async function(collection, aggregation) {
	const result = await collection.rawCollection().aggregate(aggregation).toArray();
	return result;
};

const orgObserver = registerObserver(doc => {
	if(!doc.theme) return doc;

	const theme = Themes.findOne({ _id: doc.theme });
	const settings = PresentationSettings.findOne({ _id: theme.presentationSettings });
	const memberThemes = MemberThemes.find({ theme: doc.theme }).fetch();

	return OrgTransformer(doc, theme, settings, memberThemes);
});


// Organizations - All orgs for theme
Meteor.publish('organizations', function(themeId) {
	if(!themeId) return null;

	const memberThemesObserver = MemberThemes.find({ theme: themeId }).observe(registerObserver(doc => doc));
	const orgsObserver = Organizations.find({ theme: themeId }).observe(orgObserver('organizations', this));
	this.onStop(() => { 
		memberThemesObserver.stop();
		orgsObserver.stop();
	});
	this.ready();
});
/*
// TopOrgs - Top voted orgs from first round of voting
Meteor.publish('topOrgs', function(themeId) {
	if(!themeId) return null;
	// TODO: Filter by top chit votes
	const observer = Organizations.find({ theme: themeId }).observe(orgObserver('organizations', this));
	this.onStop(() => observer.stop());
	this.ready();
});

// Organization - Single org
Meteor.publish('organization', function(orgId) {
	if(!orgId) return null;

	const observer = Organizations.find({ _id: orgId }).observe(orgObserver('organization', this));
	this.onStop(() => observer.stop());
	this.ready();
});
*/