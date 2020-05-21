import React from 'react'
import numeral from 'numeral'
import { observer } from 'mobx-react-lite'
import { useOrgs } from '/imports/api/providers'

import { Table } from 'semantic-ui-react'

const ChitVotingPane = observer(() => {
	const { orgs } = useOrgs()

	return (
		<React.Fragment>
			<Table celled striped unstackable columns={ 3 }>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Organization</Table.HeaderCell>
						<Table.HeaderCell>Chit Votes</Table.HeaderCell>
						<Table.HeaderCell>Voted Amount</Table.HeaderCell>
						<Table.HeaderCell>Pledges</Table.HeaderCell>
						<Table.HeaderCell>Ask</Table.HeaderCell>
						<Table.HeaderCell>Need</Table.HeaderCell>
					</Table.Row>
				</Table.Header>

				<Table.Body>
					{ orgs.values.map((org, i) => (
						<Table.Row key={ org._id }>
							<Table.Cell>{ org.title }</Table.Cell>
							<Table.Cell collapsing>{ org.votes }</Table.Cell>
							<Table.Cell collapsing>{ org.votedTotal }</Table.Cell>
							<Table.Cell>{ numeral(org.pledgeTotal / 2).format('$0,0') }</Table.Cell>
							<Table.Cell>{ numeral(org.ask).format('$0,0') }</Table.Cell>
							<Table.Cell>{ org.need }</Table.Cell>
						</Table.Row>
					)) }
				</Table.Body>
			</Table>
		</React.Fragment>
	)
})

export default ChitVotingPane
