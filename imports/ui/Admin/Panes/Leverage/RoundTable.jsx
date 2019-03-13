import React from 'react';

import numeral from 'numeral';
import _ from 'underscore';

import { Table, Header } from 'semantic-ui-react';


const RoundTable = props => {

	let totals = {
		percent: 0,
		funds: 0,
		total: 0,
		needed: 0
	};

	props.orgs.map(org => {
		totals.percent += org.percent;
		totals.funds += org.roundFunds;
		totals.total += org.allocatedFunds + org.leverageFunds;
		totals.needed += org.need;
	});

	return(
		<Table>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Organization</Table.HeaderCell>
					<Table.HeaderCell>Earned Funds</Table.HeaderCell>
					<Table.HeaderCell>% of Funds</Table.HeaderCell>
					<Table.HeaderCell>Total Earned</Table.HeaderCell>
					<Table.HeaderCell>Still Needed</Table.HeaderCell>
				</Table.Row>
			</Table.Header>

			<Table.Body>{props.orgs.map(org => (

				<Table.Row key={org._id}>
					<Table.Cell>{org.title}</Table.Cell>
					<Table.Cell>{org.roundFunds === 0 ? '-' : numeral(org.roundFunds).format('$0,0.00')}</Table.Cell>
					<Table.Cell>{org.percent === 0 ? '-' : numeral(org.percent).format('0.0000%')}</Table.Cell>
					<Table.Cell>{numeral(org.allocatedFunds + org.leverageFunds).format('$0,0.00')}</Table.Cell>
					<Table.Cell>{org.need === 0 ? '-' : numeral(org.need).format('$0,0.00')}</Table.Cell>
				</Table.Row>

			))}</Table.Body>

			<Table.Footer>
				<Table.Row color="orange">
					<Table.HeaderCell align="right">Totals:</Table.HeaderCell>
					<Table.HeaderCell>{numeral(totals.funds).format('$0,0.00')}</Table.HeaderCell>
					<Table.HeaderCell>{numeral(totals.percent).format('0.00%')}</Table.HeaderCell>
					<Table.HeaderCell>{numeral(totals.total).format('$0,0.00')}</Table.HeaderCell>
					<Table.HeaderCell>{numeral(totals.needed).format('$0,0.00')}</Table.HeaderCell>
				</Table.Row>
			</Table.Footer>
		</Table>
	);
};

export default RoundTable;
