import Meter from 'meteor/meteor';
import React, { useContext } from 'react';
import _ from 'lodash';

import { ThemeContext, OrganizationContext } from '/imports/context';

import { Loader, Grid, Table, Header, Segment, Container } from 'semantic-ui-react';

import ChitInputs from './ChitInputs';
import TopOrgsByChitVote from './TopOrgsByChitVote';
import SavedOrg from './SavedOrg';

const ChitVotingPane = props => {

	const { theme } = useContext(ThemeContext);
	const { orgs }  = useContext(OrganizationContext);

	return (
		<React.Fragment>
			<Grid columns={2} divided>
				<Grid.Row>

					<Grid.Column>

						<Table celled striped unstackable columns={3}>
							<Table.Header>
								<Table.Row>
									<Table.HeaderCell>Organization</Table.HeaderCell>
									<Table.HeaderCell>Weight of Tokens</Table.HeaderCell>
									<Table.HeaderCell>Token Count</Table.HeaderCell>
								</Table.Row>
							</Table.Header>

							<Table.Body>
							{orgs.map((org, i) => (
								<ChitInputs
									org={org}
									key={i}
									tabInfo={{index: i+1, length: orgs.length}}
								/>
							))}
							</Table.Body>
						</Table>

					</Grid.Column>

					<Grid.Column>
						<TopOrgsByChitVote />
					</Grid.Column>

				</Grid.Row>
			</Grid>
			{theme.saves && theme.saves.length > 0 && <Container>
				<Header as="h2">Saved Orgs</Header>
				<Grid columns={2}>

					<Grid.Row>
					{theme.saves.map((save, i) => <SavedOrg org={_.filter(orgs, ['_id', save.org])[0]} save={save} key={i} /> )}
					</Grid.Row>

				</Grid>
			</Container>}
		</React.Fragment>
	);
}

export default ChitVotingPane;
