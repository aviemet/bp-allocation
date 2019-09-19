import React from 'react';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

import { Grid, Table } from 'semantic-ui-react';

import ChitInputs from './ChitInputs';
import TopOrgsByChitVote from './TopOrgsByChitVote';

const ChitVotingPane = observer(() => {
	const data  = useData();
	const orgs = data.orgs.values;

	return (
		<React.Fragment>
			<Grid columns={ 2 } divided>
				<Grid.Row>

					<Grid.Column>

						<Table celled striped unstackable columns={ 3 }>
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
										org={ org }
										key={ i }
										tabInfo={ { index: i + 1, length: orgs.length } }
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

		</React.Fragment>
	);
});

ChitVotingPane.propTypes = {};

export default ChitVotingPane;
