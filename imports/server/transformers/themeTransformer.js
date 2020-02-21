
import { isEmpty } from 'lodash';
import { roundFloat } from '/imports/lib/utils';

const ThemeTransformer = (doc, topOrgs, memberThemes, settings) => {
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
			memberThemes.map(member => {
				voteAllocated += member.allocations.reduce((sum, allocation) => { return allocation.amount + sum; }, 0);
			});
		// Calculate total count if not using kiosk method
		} else {
			voteAllocated = topOrgs.reduce((sum, org) => {
				return sum + parseFloat(org.votedTotal || 0); 
			}, voteAllocated);
		}
		return voteAllocated;
	}();

	/**
	 * Whether voting has begun
	 * True if at least one person has cast a vote
	 */
	doc.votingStarted = function() {
		return memberThemes.some(member => {
			return member.allocations.some(vote => vote.amount > 0);
		});
	}();


	/**
	* Amount given to orgs other than top orgs
	*/
	doc.consolationTotal = function() {
		if(doc.consolationActive) {
			return (doc.organizations.length - doc.numTopOrgs) * doc.consolationAmount;
		}
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
	doc.leverageRemaining = function() {
		// Leverage moving forward into allocation round
		let remainingLeverage = (doc.leverageTotal) - doc.consolationTotal - doc.votedFunds;

		// Subtract the amounts allocated to each org
		topOrgs.map((org, i) => {
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
			if(!isEmpty(org.pledges)) {
				// TODO: This should be calculated based on the match ratio
				remainingLeverage -= org.pledges.reduce((sum, pledge) => { return sum + pledge.amount; }, 0);
			}
		});

		if(remainingLeverage <= 0) return 0; // Lower bounds check in case the total pot has not been set
		return roundFloat(remainingLeverage);
	}();

	// doc.presentationSettings = settings;

	return doc;
};

export default ThemeTransformer;