import { Meteor } from 'meteor/meteor';
import { registerObserver, filterTopOrgs, getNumTopOrgs } from './methods';

import { Themes, Organizations } from '/imports/api';

const themeObserver = registerObserver(doc => {
	const orgs = Organizations.find({ theme: doc._id }).fetch();
	const topOrgs = filterTopOrgs(orgs, doc);

	doc.pledgedTotal2 = function() {
		let total = 0;
		topOrgs.map(org => {
			if(org.pledges) {
				total += org.pledges.reduce((sum, pledge) => { return sum + pledge.amount; }, 0);
			}
		});
		return total;
	}();

	/**
	* Amount given to orgs other than top orgs
	*/
	doc.consolationTotal2 = function() {
		if(doc.consolationActive) return (orgs.length - getNumTopOrgs(doc)) * doc.consolationAmount;
		return 0;
	}();

	/**
	* Amount of the total pot still unassigned
	*   Total Pot
	* - Consolation
	* - Member Votes
	* - Crowd Favorite Topoff
	* - Matched Pledges
	* = leverageRemaining
	*/
	doc.leverageRemaining2 = function() {
		// Leverage moving forward into allocation round
		let remainingLeverage = (this.leverageTotal) - this.consolationTotal - this.votedFunds;

		// Subtract the amounts allocated to each org
		this.parent.orgs.topOrgs.map((org, i) => {
			// Amount from dollar voting round
			/*let amountFromVotes = 0;
			if(this.parent.settings.useKioskFundsVoting) {
				this.parent.members.values.map(member => {
					let vote = _.find(member.allocations, ['organization', org._id]) || false;
					amountFromVotes += vote.amount || 0;
				});
			}
			remainingLeverage -= parseInt(amountFromVotes || 0);*/

			// The topoff for the crowd favorite
			if(org.topOff > 0){
				remainingLeverage -= org.topOff;
			}
			
			// Individual pledges from members
			if(!_.isEmpty(org.pledges)) {
				// TODO: This should be calculated based on the match ratio
				remainingLeverage -= org.pledges.reduce((sum, pledge) => { return sum + pledge.amount; }, 0);
			}
		});

		if(remainingLeverage <= 0) return 0; // Lower bounds check in case the total pot has not been set
		return parseFloat((remainingLeverage).toFixed(2));
	}();

	/**
	* Total amount of dollar votes
	*/
	doc.votedFunds2 = function() {
		let voteAllocated = 0;

		// Calculate based on individual votes if using kiosk method
		if(this.parent.settings.useKioskFundsVoting) {
			this.parent.members.values.map(member => {
				voteAllocated += member.theme.allocations.reduce((sum, allocation) => { return allocation.amount + sum; }, 0);
			});
		// Calculate total count if not using kiosk method
		} else {
			voteAllocated = this.parent.orgs.topOrgs.reduce((sum, org) => { return sum + parseFloat(org.votedTotal || 0); }, voteAllocated);
			/*this.parent.orgs.topOrgs.map((org) => {
				voteAllocated += parseFloat(org.votedTotal || 0);
				// voteAllocated += parseFloat(org.topOff || 0);
			});*/
		}
		return voteAllocated;
	}();

	doc.votingStarted2 = function() {
		return this.parent.members.values.some(member => {
			return member.theme.allocations.some(vote => vote.amount > 0);
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
