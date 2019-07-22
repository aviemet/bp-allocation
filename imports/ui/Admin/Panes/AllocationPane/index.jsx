import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import numeral from 'numeral';

import { ThemeContext, OrganizationContext, PresentationSettingsContext } from '/imports/context';

import { Grid, Table, Button, Header } from 'semantic-ui-react';

import Breakdown from './Breakdown';
import AllocationInputs from './AllocationInputs';
import Pledges from './Pledges';

import { ShowLeverageToggle } from '/imports/ui/Components/Toggles';

const AllocationPane = props => {

	const { theme } = useContext(ThemeContext);
	const { topOrgs } = useContext(OrganizationContext);
	const { settings } = useContext(PresentationSettingsContext);

	console.log({ format: settings.numberFormat });

	const _calculateCrowdFavorite = () => {
		let favorite = 0;

		topOrgs.map((org, i) => {
			let favoriteAmount = topOrgs[favorite].amountFromVotes || 0;
			if(org.amountFromVotes > favoriteAmount){
				favorite = i;
			}
		});
		return favorite;
	};

	return (
		<Grid>

			{/* Breakdown Segment */}
			<Grid.Row>
				<Grid.Column>
					<Breakdown />
				</Grid.Column>
			</Grid.Row>

			<Grid.Row>
				<Grid.Column width={ 10 }>
					<Header as='h2'>Top {topOrgs.length} Funds Allocation</Header>
				</Grid.Column>

				{!props.hideAdminFields && <React.Fragment>
					<Grid.Column width={ 2 } align='right'>
						<Link to={ `/simulation/${theme._id}` } target='_blank'>
							<Button>Simulate</Button>
						</Link>
					</Grid.Column>

					<Grid.Column width={ 4 }>
						<ShowLeverageToggle />
					</Grid.Column>
				</React.Fragment>}

			</Grid.Row>
			<Grid.Row>
				<Grid.Column>

					<Table celled striped unstackable definition>
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell></Table.HeaderCell>
								<Table.HeaderCell>Voted Amount</Table.HeaderCell>
								<Table.HeaderCell>Matched Pledges (x{theme.matchRatio})</Table.HeaderCell>
								<Table.HeaderCell>Funded</Table.HeaderCell>
								<Table.HeaderCell>Ask</Table.HeaderCell>
								<Table.HeaderCell>Need</Table.HeaderCell>
								{!props.hideAdminFields &&
								<Table.HeaderCell collapsing></Table.HeaderCell>
								}
							</Table.Row>
						</Table.Header>

						<Table.Body>
							{topOrgs.map((org, i) => (
								<AllocationInputs
									key={ i }
									org={ org }
									theme={ theme }
									crowdFavorite={ (i === _calculateCrowdFavorite()) }
									tabInfo={ { index: i + 1, length: topOrgs.length } }
									hideAdminFields={ props.hideAdminFields || false }
								/>
							))}
						</Table.Body>

						<Table.Footer>
							<Table.Row textAlign='right' className='bold'>
								<Table.HeaderCell>Totals:</Table.HeaderCell>
								<Table.HeaderCell>{ 
									numeral(topOrgs.reduce((sum, org) => { return sum + org.amountFromVotes; }, 0)).format('$0,0') 
								}</Table.HeaderCell>
								<Table.HeaderCell>{
									numeral(topOrgs.reduce((sum, org) => {
										return sum + org.pledges.reduce((sum, pledge) => {
											return sum + pledge.amount;
										}, 0); 
									}, 0)).format('$0,0')
								}</Table.HeaderCell>
								<Table.HeaderCell>{
									numeral(topOrgs.reduce((sum, org) => { return sum + org.allocatedFunds; }, 0)).format('$0,0')
								}</Table.HeaderCell>
								<Table.HeaderCell>{
									numeral(topOrgs.reduce((sum, org) => { return sum + org.ask; }, 0)).format('$0,0')
								}</Table.HeaderCell>
								<Table.HeaderCell>{
									numeral(topOrgs.reduce((sum, org) => { return sum + org.need - org.leverageFunds; }, 0)).format('$0,0')
								}</Table.HeaderCell>
								<Table.HeaderCell></Table.HeaderCell>
							</Table.Row>
						</Table.Footer>
					</Table>

				</Grid.Column>
			</Grid.Row>

			<Grid.Row columns={ 1 }>
				<Grid.Column>
					<Pledges hideAdminFields={ props.hideAdminFields || false } />
				</Grid.Column>
			</Grid.Row>
		</Grid>
	);

};

AllocationPane.propTypes = {
	hideAdminFields: PropTypes.bool
};

export default AllocationPane;
