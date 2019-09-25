import _ from 'lodash';
import { toJS } from 'mobx';
import { roundFloat } from '/imports/utils';

class Leverage {
	rounds = [];

	/**
	 * Clone top orgs (so no reference issues)
	 * Add an accumulator for the leverage allocation per round
	 * Also calculate sumRemainingOrgs for first round leverage
	 */
	constructor(orgs, leverageRemaining) {

		this.leverageRemaining = leverageRemaining;

		let sumRemainingOrgs = 0;
		this.orgs = _.cloneDeep(toJS(orgs)).map(org => {
			console.log({ need: org.need });
			let orgClone = toJS(org);

			delete orgClone.parent;
			delete orgClone.createdAt;
			orgClone.save = org.save;
			orgClone.pledgeTotal = org.pledgeTotal;
			orgClone.amountFromVotes = org.amountFromVotes;
			orgClone.allocatedFunds = org.allocatedFunds;
			orgClone.need = org.need;

			// Accumulator for funds recieved from leverage spread
			orgClone.leverageFunds = 0;

			// Use the loop to calculate the funding total of orgs not fully funded
			sumRemainingOrgs = roundFloat(sumRemainingOrgs + orgClone.allocatedFunds);

			return orgClone;
		});
		console.log({ orgs: this.orgs });
		this.sumRemainingOrgs = sumRemainingOrgs;
	}

	/**
	 * Returns array of "rounds" representing the distribution of the remaining leverage
	 */
	getLeverageSpreadRounds() {
		let nRounds = 1;
		while(this.leverageRemaining >= 1 && this._numFullyFundedOrgs() < this.orgs.length && nRounds < 10) {

			let round = {
				leverageRemaining: this.leverageRemaining,
				sumRemainingOrgs: this.sumRemainingOrgs
			};

			let trackers = {
				newSumRemainingOrgs: 0,
				givenThisRound: 0
			};

			let roundOrgs = this.orgs.map(org => {
				org = this._orgRoundValues(org, nRounds);

				// Decrease remaining leverage by amount awarded
				trackers.givenThisRound = roundFloat(trackers.givenThisRound + org.roundFunds);

				// Only orgs not yet funded are counted in the percentage ratio for next round
				if(org.need > 0){
					trackers.newSumRemainingOrgs = roundFloat(trackers.newSumRemainingOrgs + org.allocatedFunds);
				}

				return org;
			});

			this.sumRemainingOrgs = trackers.newSumRemainingOrgs;
			this.leverageRemaining = roundFloat(this.leverageRemaining - trackers.givenThisRound);

			round.orgs = _.cloneDeep(roundOrgs);
			this.rounds.push(round);
			nRounds++;
		}

		return this.rounds;
	}

	_orgRoundValues(org, nRounds) {
		/** DEFAULTS **/
		org.roundFunds = 0; // Amount allocated to org this round
		org.percent = 0; // Percentage of remaining pot used for allocation

		// Calculate all percentage on 1st, subsequently
		// only calculate percentage if not fully funded
		if(nRounds === 1 || org.need > 0 && this.sumRemainingOrgs !== 0) {
			// Percent: (funding amount from voting/pledges) / (sum of that amount for orgs not yet fully funded)
			org.percent = org.allocatedFunds / this.sumRemainingOrgs;
		}

		// Give funds for this round
		org.roundFunds = roundFloat(Math.min(
			org.percent * this.leverageRemaining,
			org.need
		));

		// Accumulate the running total of all accrued funds during leverage rounds
		org.leverageFunds = roundFloat(org.leverageFunds + org.roundFunds);

		// Amount needed to be fully funded
		org.need = roundFloat(org.ask - org.allocatedFunds - org.leverageFunds);

		return org;
	}

	_numFullyFundedOrgs() {
		return this.orgs.reduce((sum, org) => {
			return sum + (org.need <= 0 ? 1 : 0);
		}, 0);
	}

	finalRoundAllcoation() {
		if(this.rounds.length === 0) return;

		let lastRound = this.rounds[this.rounds.length - 1];
		let leverageRemaining = lastRound.leverageRemaining;
		let funds = lastRound.orgs.reduce((sum, org) => {
			return sum + (org.leverageFunds > 0 ? org.roundFunds : 0);
		}, 0);

		return roundFloat(leverageRemaining - funds);
	}
}

export default Leverage;