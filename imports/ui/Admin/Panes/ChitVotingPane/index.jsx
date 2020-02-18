import React, { useState } from 'react';

import { observer } from 'mobx-react-lite';
import { useOrgs } from '/imports/api/providers';

import { Grid, Table, Responsive, Loader } from 'semantic-ui-react';

import ChitInputs from './ChitInputs';
import TopOrgsByChitVote from './TopOrgsByChitVote';

const ChitVotingPane = observer(() => {
	const { orgs, topOrgs, isLoading: orgsLoading } = useOrgs();

	const [ gridColumns, setGridColumns ] = useState(2);

	const handleOnUpdate = (e, { width }) => {
		if(width > Responsive.onlyTablet.minWidth) {
			setGridColumns(2);
		} else {
			setGridColumns(1);
		}
	};

	if(orgsLoading) return <Loader active />;

	const topOrgIds = topOrgs.map(org => org._id);

	return (
		<Responsive 
			as={ Grid } 
			columns={ gridColumns }
			divided={ gridColumns > 1 }
			fireOnMount
			onUpdate={ handleOnUpdate }
		>
			<Grid.Row>

				<Grid.Column>

					<Table celled striped columns={ 3 }>
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell>Organization</Table.HeaderCell>
								<Table.HeaderCell>Weight of Tokens</Table.HeaderCell>
								<Table.HeaderCell>Token Count</Table.HeaderCell>
							</Table.Row>
						</Table.Header>

						<Table.Body>
							{orgs.values.map((org, i) => (
								<ChitInputs
									org={ org }
									key={ i }
									tabInfo={ { index: i + 1, length: orgs.length } }
									positive={ topOrgIds.includes(org._id) }
								/>
							))}
						</Table.Body>
					</Table>

				</Grid.Column>

				<Grid.Column>
					<TopOrgsByChitVote />
				</Grid.Column>

			</Grid.Row>
		</Responsive>
	);
});

ChitVotingPane.propTypes = {};

export default ChitVotingPane;
