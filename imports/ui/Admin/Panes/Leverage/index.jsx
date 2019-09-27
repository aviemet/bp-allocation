import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import numeral from 'numeral';

import { roundFloat } from '/imports/utils';

import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useData } from '/imports/stores/DataProvider';
import { ThemeMethods } from '/imports/api/methods';
import LeverageObject from './Leverage';

import { Header, Segment, Grid, Button } from 'semantic-ui-react';

import RoundTable from './RoundTable';
import ResultsTable from './ResultsTable';

const Leverage = observer(props => {
	const data = useData();
	const { theme } = data;
	const topOrgs = data.orgs.topOrgs;

	const leverage = new LeverageObject(topOrgs, theme.leverageRemaining);
	const rounds = leverage.getLeverageSpreadRounds();

	/**
	 * Returns array of "rounds" representing the distribution of the remaining
	 * leverage
	 * @param  {Object} topOrgs           Top Orgs for the theme
	 * @param  {Number} leverageRemaining Amount of remaining leverage
	 * @return {Array}                    Array of Objects (rounds)
	 */
	/*const getLeverageSpreadRounds = (leverageRemaining) => {
		let { orgs, sumRemainingOrgs } = _initLeverageVars();
		let rounds = [];

		let nRounds = 1;
		while(leverageRemaining >= 1 && _numFullyFundedOrgs(orgs) < orgs.length && nRounds < 10) {

			let round = {
				leverageRemaining: leverageRemaining,
				sumRemainingOrgs: sumRemainingOrgs
			};

			let trackers = {
				newSumRemainingOrgs: 0,
				givenThisRound: 0
			};

			let roundOrgs = orgs.map(org => {
				org = _orgRoundValues(org, nRounds, leverageRemaining, sumRemainingOrgs);

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
	};

	const _orgRoundValues = (org, nRounds, leverageRemaining, sumRemainingOrgs) => {
		// DEFAULTS
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
	};
*/
	/**
	 * Clone top orgs (so no reference issues)
	 * Add an accumulator for the leverage allocation per round
	 * Also calculate sumRemainingOrgs for first round leverage
	 */
	/*const _initLeverageVars = () => {
		// Amount allocated so far to top-orgs which have not yet been fully funded
		let sumRemainingOrgs = 0;

		let orgs = _.cloneDeep(topOrgs).map(org => {
			// Accumulator for funds recieved from leverage spread
			org.leverageFunds = 0;

			// Use the loop to calculate the funding total of orgs not fully funded
			sumRemainingOrgs = roundFloat(sumRemainingOrgs + org.allocatedFunds);

			return org;
		});

		return { orgs, sumRemainingOrgs };
	};

	/*const _numFullyFundedOrgs = (orgs) => {
		return orgs.reduce((sum, org) => {
			return sum + (org.need <= 0 ? 1 : 0);
		}, 0);
	};

	/*const finalRoundAllcoation = (rounds) => {
		let lastRound = rounds[rounds.length - 1];
		let leverageRemaining = lastRound.leverageRemaining;
		let funds = lastRound.orgs.reduce((sum, org) => {
			return sum + (org.leverageFunds > 0 ? org.roundFunds : 0);
		}, 0);
		return roundFloat(leverageRemaining - funds);
	};*/

	const saveLeverageSpread = (lastRound) => {
		ThemeMethods.saveLeverageSpread.call(lastRound.orgs);
	};

	const resetLeverage = () => {
		const orgs = topOrgs.map(org => {
			let orgClone = toJS(org);
			delete orgClone.parent;
			return orgClone;
		});
		ThemeMethods.resetLeverage.call(orgs);
	};

	// const rounds = getLeverageSpreadRounds(theme.leverageRemaining);

	if(rounds.length === 0) {
		return (
			<React.Fragment>
				<Header as='h1'>Not enough leverage to assign to organizations</Header>
				<p>Check if amount has been entered to the &apos;Total Pot&apos; field in Theme Settings</p>
			</React.Fragment>
		);
	}

	const orgSpreadSum = topOrgs.reduce((sum, org) => { return sum + org.leverageFunds; }, 0);
	const roundSpreadSum = rounds[rounds.length - 1].orgs.reduce((sum, org) => { return sum + org.leverageFunds; }, 0);

	const leverageDistributed = orgSpreadSum === roundSpreadSum;

	return (
		<React.Fragment>
			<Segment color='violet'>
				<Grid>
					<Grid.Row>
						<Grid.Column width={ 6 }>
							<Header as="h2">Final Distribution</Header>
						</Grid.Column>
						<Grid.Column width={ 4 }>
							<span>Leverage Remaining: {numeral(leverage.finalRoundAllcoation(rounds)).format('$0,0.00')}</span><br/>
						</Grid.Column>
						<Grid.Column width={ 6 }>
							{ !props.hideAdminFields && <React.Fragment>
								{ !leverageDistributed ? (
									<Button
										color='green'
										onClick={ () => saveLeverageSpread(rounds[rounds.length - 1]) }
									>
										Submit Final Values
									</Button>
								) : (
									<Button
										color='red'
										onClick={ resetLeverage }
									>
										Reset Leverage Distribution
									</Button>
								) }
							</React.Fragment> }
						</Grid.Column>
					</Grid.Row>

					<Grid.Row>
						<Grid.Column>
							<ResultsTable round={ rounds[rounds.length - 1] } />
						</Grid.Column>
					</Grid.Row>
				</Grid>
			</Segment>

			{ rounds.map((round, i) => (
				<Segment key={ i }>
					<Grid>
						<Grid.Row>
							<Grid.Column width={ 6 }>
								<Header as="h2">Round {i + 1}</Header>
							</Grid.Column>
							<Grid.Column width={ 10 }>
								<span>Leverage Remaining: {numeral(round.leverageRemaining).format('$0,0.00')}</span><br/>
								<span>Remaining Orgs Sum: {numeral(round.sumRemainingOrgs).format('$0,0.00')}</span>
							</Grid.Column>
						</Grid.Row>

						<Grid.Row>
							<Grid.Column>
								<RoundTable orgs={ round.orgs } />
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</Segment>
			)) }
		</React.Fragment>
	);
});

Leverage.propTypes = {
	hideAdminFields: PropTypes.bool
};

export default Leverage;
