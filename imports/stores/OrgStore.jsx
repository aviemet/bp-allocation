import TrackableCollection from './TrackableCollection';
import { computed, toJS, observable, extendObservable } from 'mobx';
import { filterTopOrgs, roundFloat } from '/imports/utils';
import _ from 'lodash';

class OrgStore {
	constructor(org, parent) {
		this.parent = parent;

		const { amountFromVotes } = org;
		delete org.amountFromVotes;
		// Make all fields on the object observable
		extendObservable(this, {
			_amountFromVotes: amountFromVotes,
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
	get amountFromVotes() {
		// If voting with kiosk mode, get votes for this org from each member
		// Override the model field 'amountFromVotes'
		let amount = this._amountFromVotes;
		if(this.parent.settings.useKioskFundsVoting) {
			this.parent.members.values.map(member => {
				let vote = _.find(member.allocations, ['organization', this._id]) || false;
				amount += vote.amount || 0;
			});
		}
		return amount;
	}

	@computed
	get allocatedFunds() {
		// Total amount of money allocted to this org aside from leverage distribution
		return roundFloat((this.amountFromVotes || 0) + this.pledgeTotal + this.save + this.topOff);
	}

	@computed
	get need() {
		// Amount needed to reach goal
		let need = this.ask - this.allocatedFunds;
		return roundFloat(need > 0 ? need : 0);
	}
}

export default OrgStore;