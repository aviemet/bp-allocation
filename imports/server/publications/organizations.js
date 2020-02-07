import { Meteor } from 'meteor/meteor';

import { Organizations } from '/imports/api';

const orgTransform = doc => {
	doc.need2 = doc.pledges.length > 0 ? doc.ask - doc.pledges.reduce((sum, pledge) => sum + pledge.amount, 0) : doc.ask;
	return doc;
};

const orgObserver = (title, self) => {
	return {
		added: doc => {
			return self.added(title, doc._id, orgTransform(doc));
		},
		changed: (newDoc, oldDoc) => {
			return self.changed(title, newDoc._id, orgTransform(newDoc));
		},
		removed: oldDoc => {
			return self.removed(title, oldDoc._id);
		}
	};
};

// Organizations - All orgs for theme
Meteor.publish('organizations', function(themeId) {
	if(!themeId) return null;

	const observer = Organizations.find({ theme: themeId }).observe(orgObserver('organizations', this));
	this.onStop(() => observer.stop());
	this.ready();
});

// Organization - Single org
Meteor.publish('organization', orgId => {
	if(!orgId) return null;

	const observer = Organizations.find({ _id: orgId }).observe(orgObserver(this));
	this.onStop(() => observer.stop());
	this.ready();
});