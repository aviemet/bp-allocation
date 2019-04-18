import React from 'react';
import _ from 'lodash';
import numeral from 'numeral';

import { roundFloat } from '/imports/utils';

import { ThemeMethods } from '/imports/api/methods';

import { Header, Loader, Segment, Grid, Button } from 'semantic-ui-react';

import RoundTable from './RoundTable';
import ResultsTable from './ResultsTable';

export default class Leverage extends React.Component {
	constructor(props) {
		super(props);
	}

	/**
	 * Returns array of "rounds" representing the distribution of the remaining
	 * leverage
	 * @param  {Object} topOrgs           Top Orgs for the theme
	 * @param  {Number} leverageRemaining Amount of remaining leverage
	 * @return {Array}                    Array of Objects (rounds)
	 */
	getLeverageSpreadRounds = (topOrgs, leverageRemaining) => {
		let { orgs, sumRemainingOrgs } = this._initLeverageVars(topOrgs);
		let rounds = [];

		let nRounds = 1;
		while((leverageRemaining >= 1 || this._numFullyFundedOrgs(orgs) === orgs.length) && nRounds < 10) {

			let round = {
				leverageRemaining: leverageRemaining,
				sumRemainingOrgs: sumRemainingOrgs
			};

			let trackers = {
				newSumRemainingOrgs: 0,
				givenThisRound: 0
			}

			let roundOrgs = orgs.map(org => {
				org = this._orgRoundValues(org, nRounds, leverageRemaining, sumRemainingOrgs);

				// Decrease remaining leverage by amount awarded
				trackers.givenThisRound = roundFloat(trackers.givenThisRound + org.roundFunds);

				// Only orgs not yet funded are counted in the percentage ratio for next round
				if(org.need > 0){
					trackers.newSumRemainingOrgs = roundFloat(trackers.newSumRemainingOrgs + org.allocatedFunds);
				}

				return org;
			});

 			sumRemainingOrgs = trackers.newSumRemainingOrgs;
 			leverageRemaining = roundFloat(leverageRemaining - trackers.givenThisRound);

			round.orgs = _.cloneDeep(roundOrgs);
			rounds.push(round);
			nRounds++;
		}

		return rounds;
	}

	_orgRoundValues = (org, nRounds, leverageRemaining, sumRemainingOrgs) => {
		/** DEFAULTS **/
		org.roundFunds = 0; // Amount allocated to org this round
		org.percent = 0; // Percentage of remaining pot used for allocation

		// Calculate all percentage on 1st, subsequently
		// only calculate percentage if not fully funded
		if(nRounds === 1 || org.need > 0 && sumRemainingOrgs !== 0) {
			// Percent: (funding amount from voting/pledges) / (sum of that amount for orgs not yet fully funded)
			org.percent = org.allocatedFunds / sumRemainingOrgs;
		}

			// Give funds for this round
	  org.roundFunds = roundFloat(Math.min(
	    org.percent * leverageRemaining,
	    org.need
	  ));

		// Accumulate the running total of all accrued funds during leverage rounds
		org.leverageFunds = roundFloat(org.leverageFunds + org.roundFunds);

		// Amount needed to be fully funded
		org.need = roundFloat(org.ask - org.allocatedFunds - org.leverageFunds);

		return org;
	}

 	/**
 	 * Clone top orgs (so no reference issues) and add some more variables to the object. Also calculate sumRemainingOrgs
 	 * @param  {[type]} orgsOriginal [description]
 	 * @return {[type]}              [description]
 	 */
	_initLeverageVars = (orgsOriginal) => {
		// Amount allocated so far to top-orgs which have not yet been fully funded
		let sumRemainingOrgs = 0;

		let orgs = _.cloneDeep(orgsOriginal).map(org => {
			// Amount from saves if any
			let save = (() => {
				let saveObj = this.props.theme.saves.find( save => save.org === org._id);
				return saveObj ? (saveObj.amount || 0) : 0;
			})();

			// Total amount allocated from all sources for this org
			org.allocatedFunds = roundFloat(org.amountFromVotes + org.pledges + org.topOff + save);
			// console.log({amountFromVotes: org.amountFromVotes, pledges: org.pledges,  topOff: org.topOff, save});

			// Accumulator for funds recieved from leverage spread
			org.leverageFunds = 0;

			// Amount needed to be fully funded
			org.need = roundFloat(org.ask - org.allocatedFunds);

			// Use the loop to calculate the funding total of orgs not fully funded
			sumRemainingOrgs = roundFloat(sumRemainingOrgs + org.allocatedFunds);

			//console.log({sumRemainingOrgs, orgAllocatedFunds: org.allocatedFunds, ask: org.ask, orgLeverageFunds: org.leverageFunds, need: org.need, save, pledges: org.pledges, topOff: org.topOff});

			return org;
		});

		return { orgs, sumRemainingOrgs };
	}

	_numFullyFundedOrgs = (orgs) => {
		return orgs.reduce((sum, org) => {
			return sum + (org.need <= 0 ? 1 : 0);
		}, 0);
	}

	finalRoundAllcoation = (rounds) => {
		let lastRound = rounds[rounds.length-1]
		let leverageRemaining = lastRound.leverageRemaining;
		let funds = lastRound.orgs.reduce((sum, org) => {
			return sum + (org.leverageFunds > 0 ? org.roundFunds : 0);
		}, 0);
		return leverageRemaining - funds;
	}

	saveLeverageSpread = (lastRound) => {
		ThemeMethods.saveLeverageSpread.call(lastRound.orgs);
	}

	resetLeverage = () => {
		ThemeMethods.resetLeverage.call(this.props.topOrgs);
	}

	render() {
		if(!this.props.theme.leverageRemaining) {
			return <Loader />
		}

		const rounds = this.getLeverageSpreadRounds(this.props.topOrgs, this.props.theme.leverageRemaining);

		const orgSpreadSum = this.props.topOrgs.reduce((sum, org) => {return sum + org.leverageFunds}, 0);
		const roundSpreadSum = rounds[rounds.length-1].orgs.reduce((sum, org) => {return sum + org.leverageFunds}, 0);

		const leverageDistributed = orgSpreadSum === roundSpreadSum;

		return (
		  <React.Fragment>
			  {rounds.map((round, i) => (
			  	<Segment key={i}>
						<Grid>
							<Grid.Row>
								<Grid.Column width={6}>
									<Header as="h2">Round {i+1}</Header>
								</Grid.Column>
								<Grid.Column width={10}>
									<span>Leverage Remaining: {numeral(round.leverageRemaining).format('$0,0.00')}</span><br/>
									<span>Remaining Orgs Sum: {numeral(round.sumRemainingOrgs).format('$0,0.00')}</span>
								</Grid.Column>
							</Grid.Row>

							<Grid.Row>
								<Grid.Column>
			  					<RoundTable orgs={round.orgs} />
								</Grid.Column>
							</Grid.Row>
						</Grid>
			  	</Segment>
		  	))}
		  	<Segment color='violet'>
					<Grid>
						<Grid.Row>
							<Grid.Column width={6}>
	  						<Header as="h2">Final Distribution</Header>
							</Grid.Column>
							<Grid.Column width={4}>
								<span>Leverage Remaining: {numeral(this.finalRoundAllcoation(rounds)).format('$0,0.00')}</span><br/>
							</Grid.Column>
							<Grid.Column width={6}>
								{!leverageDistributed ?
								<Button color='green' onClick={() => this.saveLeverageSpread(rounds[rounds.length-1])}>Submit Final Values</Button>
								:
								<Button color='red' onClick={this.resetLeverage}>Reset Leverage Distribution</Button>
								}
							</Grid.Column>
						</Grid.Row>

						<Grid.Row>
							<Grid.Column>
			  				<ResultsTable round={rounds[rounds.length-1]} />
							</Grid.Column>
						</Grid.Row>
					</Grid>
		  	</Segment>
	  	</React.Fragment>
		);
	}
}
