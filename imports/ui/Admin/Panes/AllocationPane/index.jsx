import Meter from 'meteor/meteor';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom'
import _ from 'lodash';

import numeral from 'numeral';

import { ThemeContext, OrganizationContext, PresentationSettingsContext } from '/imports/context';

import { Loader, Grid, Table, Checkbox, Button, Statistic, Segment, Header } from 'semantic-ui-react';
import styled from 'styled-components';

import Breakdown from './Breakdown';
import AllocationInputs from './AllocationInputs';
import Pledges from './Pledges';

import { ShowLeverageToggle } from '/imports/ui/Components/Toggles';

const AllocationPane = props => {

	const { theme } = useContext(ThemeContext);
	const { topOrgs } = useContext(OrganizationContext);
	const { settings } = useContext(PresentationSettingsContext);

	const _calculateCrowdFavorite = () => {
		let favorite = 0;

		topOrgs.map((org, i) => {
			let favoriteAmount = topOrgs[favorite].amountFromVotes || 0;
			if(org.amountFromVotes > favoriteAmount){
				favorite = i;
			}
		});
		return favorite;
	}

	return (
		<Grid>

			{/* Breakdown Segment */}
			<Grid.Row>
				<Grid.Column>
					<Breakdown />
			 	</Grid.Column>
			</Grid.Row>

			<Grid.Row>
				<Grid.Column width={10}>
					<Header as="h2">Top {topOrgs.length} Funds Allocation</Header>
				</Grid.Column>

				<Grid.Column width={2} align="right">
					<Link to={`/simulation/${theme._id}`} target='_blank'>
						<Button>Simulate</Button>
					</Link>
				</Grid.Column>

				<Grid.Column width={4}>
					<ShowLeverageToggle />
				</Grid.Column>

			</Grid.Row>
			<Grid.Row>
				<Grid.Column>

					<Table celled striped unstackable>
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell>Organization</Table.HeaderCell>
								<Table.HeaderCell>Voted Amount</Table.HeaderCell>
								<Table.HeaderCell>Matched Pledges</Table.HeaderCell>
								<Table.HeaderCell>Funded</Table.HeaderCell>
								<Table.HeaderCell>Ask</Table.HeaderCell>
								<Table.HeaderCell>Need</Table.HeaderCell>
								<Table.HeaderCell collapsing>Actions</Table.HeaderCell>
							</Table.Row>
						</Table.Header>

						<Table.Body>
						{topOrgs.map((org, i) => (
							<AllocationInputs
								key={i}
								org={org}
								theme={theme}
								crowdFavorite={(i === _calculateCrowdFavorite())}
								tabInfo={{index: i+1, length: topOrgs.length}}
							/>
						))}
						</Table.Body>
					</Table>

			 	</Grid.Column>
			</Grid.Row>

			<Grid.Row columns={1}>
				<Grid.Column>
					<Pledges />
				</Grid.Column>
			</Grid.Row>
		</Grid>
	);

}

export default AllocationPane;
