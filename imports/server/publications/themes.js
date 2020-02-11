import { Meteor } from 'meteor/meteor';
import { registerObserver, filterTopOrgs } from '../methods';

import { Themes, PresentationSettings, Organizations, MemberThemes } from '/imports/api/db';

const themeObserver = registerObserver(doc => {
	const settings = PresentationSettings.find({ theme: doc._id }).fetch();

	const orgs = Organizations.find({ theme: doc._id }).fetch();
	const topOrgs = filterTopOrgs(orgs, doc);

	const memberThemes = MemberThemes.find({ theme: doc._id }).fetch();
	/*const memberIds = memberThemes.map(memberTheme => memberTheme.member);
	const members = Members.find({ _id: { $in: memberIds } }).fetch();*/

	doc.pledgedTotal = function() {
		let total = 0;
		topOrgs.map(org => {
			if(org.pledges) {
				total += org.pledges.reduce((sum, pledge) => { return sum + pledge.amount; }, 0);
			}
		});
		return total;
	}();

	/**
	* Total amount of dollar votes
	*/
	doc.votedFunds = function() {
		let voteAllocated = 0;

		// Calculate based on individual votes if using kiosk method
		if(settings.useKioskFundsVoting) {
			memberThemes.values.map(member => {
				voteAllocated += member.allocations.reduce((sum, allocation) => { return allocation.amount + sum; }, 0);
			});
		// Calculate total count if not using kiosk method
		} else {
			voteAllocated = topOrgs.reduce((sum, org) => { return sum + parseFloat(org.votedTotal || 0); }, voteAllocated);
		}
		return voteAllocated;
	}();

	doc.votingStarted = function() {
		return memberThemes.some(member => {
			return member.allocations.some(vote => vote.amount > 0);
		});
	}();

	return doc;
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
	if(!themeId) return null;

	const observer = Themes.find({ _id: themeId }).observe(themeObserver('theme', this));
	this.onStop(() => observer.stop());
	this.ready();
});
