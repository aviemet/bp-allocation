import React from 'react';

import numeral from 'numeral';
import _ from 'underscore';

import { Table, Header } from 'semantic-ui-react';


const ResultsTable = props => {

	console.log({resultsProps: props});

	let totals = {
		spread: 0,
		total: 0,
		needed: 0
	};

	props.round.orgs.map(org => {
		totals.spread += org.leverageFunds;
		totals.total += org.allocatedFunds + org.leverageFunds;
		totals.needed += org.need;
	});

	return(
		<Table>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Organization</Table.HeaderCell>
					<Table.HeaderCell>Leverage Spread</Table.HeaderCell>
					<Table.HeaderCell>Ask</Table.HeaderCell>
					<Table.HeaderCell>Total Earned</Table.HeaderCell>
					<Table.HeaderCell>Still Needed</Table.HeaderCell>
				</Table.Row>
			</Table.Header>

			<Table.Body>{props.round.orgs.map(org => (

				<Table.Row key={org._id}>
					<Table.Cell>{org.title}</Table.Cell>
					<Table.Cell>{org.leverageFunds === 0 ? '-' : numeral(org.leverageFunds).format('$0,0.00')}</Table.Cell>
					<Table.Cell>{numeral(org.ask).format('$0,0.00')}</Table.Cell>
					<Table.Cell>{numeral(org.allocatedFunds + org.leverageFunds).format('$0,0.00')}</Table.Cell>
					<Table.Cell>{org.need === 0 ? '-' : numeral(org.need).format('$0,0.00')}</Table.Cell>
				</Table.Row>

			))}</Table.Body>

			<Table.Footer>
				<Table.Row color="orange">
					<Table.HeaderCell align="right">Totals:</Table.HeaderCell>
					<Table.HeaderCell>{numeral(totals.spread).format('$0,0.00')}</Table.HeaderCell>
					<Table.HeaderCell></Table.HeaderCell>
					<Table.HeaderCell>{numeral(totals.total).format('$0,0.00')}</Table.HeaderCell>
					<Table.HeaderCell>{numeral(totals.needed).format('$0,0.00')}</Table.HeaderCell>
				</Table.Row>
			</Table.Footer>
		</Table>
	);
};

export default ResultsTable;
