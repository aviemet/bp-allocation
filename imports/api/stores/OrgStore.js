import { computed, extendObservable } from 'mobx';
import { roundFloat } from '/imports/lib/utils';
import _ from 'lodash';

class OrgStore {
	constructor(org, parent) {
		this.parent = parent;

		// Make all fields on the object observable
		extendObservable(this, {
			...org
		});
	}

	@computed
	get save() {
		// Get save amount if saved
		let save = 0;
		if(!_.isEmpty(this.parent.theme.saves)) {
			save = (() => {
				let saveObj = this.parent.theme.saves.find( save => save.org === this._id);
				return saveObj ? (saveObj.amount || 0) : 0;
			})();
		}
		return save;
	}
	
	@computed
	get pledgeTotal() {
		// Total of funds pledged for this org multiplied by the match ratio
		let pledgeTotal = 0;
		if(this.pledges) {
			pledgeTotal = this.pledges.reduce((sum, pledge) => { return sum + pledge.amount;}, 0) * this.parent.theme.matchRatio;
		}
		return pledgeTotal;
	}

	@computed
	get votedTotal() {
		if(this.parent.loading) return 0; 

		// If voting with kiosk mode, get votes for this org from each member
		if(this.parent.settings.useKioskFundsVoting) {
			const amount = this.parent.members.values.reduce((sum, member) => {
				const vote = _.find(member.theme.allocations, ['organization', this._id]);
				return sum + (vote ? vote.amount : 0);
			}, 0);
			return amount;
		}
		return this.amountFromVotes;
	}

	@computed
	get allocatedFunds() {
		// Total amount of money allocted to this org aside from leverage distribution
		return roundFloat((this.votedTotal || 0) + this.pledgeTotal + this.save + this.topOff);
	}

	@computed
	get need() {
		// Amount needed to reach goal
		let need = this.ask - this.allocatedFunds;
		return roundFloat(need > 0 ? need : 0);
	}

	@computed
	get votes() {
		let votes = 0;
		if(this.chitVotes) {
			if(this.chitVotes.count) {
				// Token count has higher specificity, therefor higher precedence
				// If present, return this number
				votes = this.chitVotes.count;	
			} else if(this.chitVotes.weight) {
				// Token weight must be set in theme settings
				votes = this.chitVotes.weight / this.parent.theme.chitWeight;
			}
		}

		return roundFloat(votes, 1);
	}
}

export default OrgStore;