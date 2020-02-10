import { Meteor } from 'meteor/meteor';
import { isEmpty } from 'lodash';
import { roundFloat } from '/imports/lib/utils';
import { registerObserver } from './methods';

import { Organizations, Themes, MemberThemes } from '/imports/api';
import { PresentationSettings } from '../../api/PresentationSettings';

const orgObserver = registerObserver(doc => {
	if(!doc.theme) return doc;

	const theme = Themes.findOne({ _id: doc.theme });
	const settings = PresentationSettings.findOne({ _id: theme.presentationSettings });
	const memberThemes = MemberThemes.find({ theme: doc.theme }).fetch();

	doc.save2 = function() {
		// Get save amount if saved
		let save = 0;
		if(!isEmpty(theme.saves)) {
			save = (() => {
				let saveObj = theme.saves.find( save => save.org === doc._id);
				return saveObj ? (saveObj.amount || 0) : 0;
			})();
		}
		return save;
	}();

	doc.pledgeTotal2 = function() {
		// Total of funds pledged for this org multiplied by the match ratio
		let pledgeTotal = 0;
		if(doc.pledges) {
			pledgeTotal = doc.pledges.reduce((sum, pledge) => { return sum + pledge.amount;}, 0) * theme.matchRatio;
		}
		return pledgeTotal;
	}();

	doc.votedTotal2 = function() {
		// If voting with kiosk mode, get votes for this org from each member
		if(settings.useKioskFundsVoting) {
			const amount = memberThemes.reduce((sum, memberTheme) => {
				const vote = memberTheme.allocations.find(allocation => allocation.organization._id === doc._id);
				return sum + (vote ? vote.amount : 0);
			}, 0);
			return amount;
		}
		return this.amountFromVotes;
	}();

	doc.allocatedFunds2 = function() {
		// Total amount of money allocted to this org aside from leverage distribution
		return roundFloat((doc.votedTotal2 || 0) + doc.pledgeTotal2 + doc.save2 + doc.topOff);
	}();

	doc.need2 = function() {
		// Amount needed to reach goal
		let need = doc.ask - doc.allocatedFunds;
		return roundFloat(need > 0 ? need : 0);
	}();

	doc.votes2 = function() {
		let votes = 0;
		if(doc.chitVotes) {
			if(doc.chitVotes.count) {
				// Token count has higher specificity, therefor higher precedence
				// If present, return this number
				votes = doc.chitVotes.count;	
			} else if(doc.chitVotes.weight) {
				// Token weight must be set in theme settings
				votes = doc.chitVotes.weight / theme.chitWeight;
			}
		}

		return roundFloat(votes, 1);
	}();

	return doc;
});

// Organizations - All orgs for theme
Meteor.publish('organizations', function(themeId) {
	if(!themeId) return null;

	const observer = Organizations.find({ theme: themeId }).observe(orgObserver('organizations', this));
	this.onStop(() => observer.stop());
	this.ready();
});

// TopOrgs - Top voted orgs from first round of voting
Meteor.publish('topOrgs', function(themeId) {
	if(!themeId) return null;
	// TODO: Filter by top chit votes
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
