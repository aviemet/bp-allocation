import React from 'react';
import PropTypes from 'prop-types';
// import _ from 'lodash';
import numeral from 'numeral';

// import { roundFloat } from '/imports/lib/utils';

import { observer } from 'mobx-react-lite';
import { useTheme, useOrgs } from '/imports/api/providers';
import { ThemeMethods } from '/imports/api/methods';
import LeverageObject from '/imports/lib/Leverage';

import { Header, Segment, Grid, Button } from 'semantic-ui-react';

import RoundTable from './RoundTable';
import ResultsTable from './ResultsTable';

const Leverage = observer(props => {
	const { theme } = useTheme();
	const { topOrgs } = useOrgs();

	const leverage = new LeverageObject(topOrgs, theme.leverageRemaining);
	const rounds = leverage.getLeverageSpreadRounds();

	const saveLeverageSpread = (lastRound) => {
		ThemeMethods.saveLeverageSpread.call(lastRound.orgs);
	};

	const resetLeverage = () => {
		ThemeMethods.resetLeverage.call(theme._id);
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
