import React, { useState } from 'react'
import numeral from 'numeral'
import { observer } from 'mobx-react-lite'
import { useOrgs, useTheme, useSettings } from '/imports/api/providers'

import { Table, Checkbox } from 'semantic-ui-react'
import styled from 'styled-components'

const ChitVotingPane = observer(() => {
	const { topOrgs, orgs } = useOrgs()
	const { settings } = useSettings()
	const { theme } = useTheme()

	const [showAllOrgs, setShowAllOrgs] = useState(true)

	const displayOrgsObject = showAllOrgs ? orgs.values : topOrgs

	let totalVotes = 0
	let totalVotedMoney = 0
	let totalPledges = 0
	let totalAsk = 0
	let totalNeed = 0
	let saves = theme.saves.reduce((sum, save) => { return sum + save.amount }, 0)
	let totalGiven = parseFloat((theme.leverageTotal || 0) + saves + (settings.resultsOffset || 0))
	topOrgs.forEach(org => totalGiven += org.pledgeTotal / 2)

	return (
		<>
			<Checkbox toggle checked={ !showAllOrgs } label={ <label>Show only top orgs</label> } onClick={ () => setShowAllOrgs(!showAllOrgs) } />
			<Table celled striped unstackable columns={ 3 } textAlign='right'>
				<Table.Header>
					<Table.Row>
						<Table.Cell colSpan={ 5 } textAlign='right'>Total Pot:</Table.Cell>
						<Table.HeaderCell>{ numeral(totalGiven).format('$0,0') }</Table.HeaderCell>
					</Table.Row>
					<Table.Row textAlign='left'>
						<Table.HeaderCell>Organization</Table.HeaderCell>
						<Table.HeaderCell collapsing>
							<FlexHeading>
								<span className="full">Chit Votes</span>
								<span>
									{ settings.useKioskChitVoting && <>
										{`(${theme.chitVotesCast}/${theme.totalMembers})`} <span style={ { fontSize: '0.75em' } }>Members Voted</span>
									</> }
								</span>
							</FlexHeading>
						</Table.HeaderCell>
						<Table.HeaderCell>
							<FlexHeading>
								<span className="full">Voted Amount</span>
								<span>
									{ settings.useKioskFundsVoting && <>
										{ `(${theme.fundsVotesCast}/${theme.totalMembers})` } <span style={ { fontSize: '0.75em' } }>Members Voted</span>
									</> }
								</span>
							</FlexHeading>
						</Table.HeaderCell>
						<Table.HeaderCell>Pledges</Table.HeaderCell>
						<Table.HeaderCell>Ask</Table.HeaderCell>
						<Table.HeaderCell>Need</Table.HeaderCell>
					</Table.Row>
				</Table.Header>

				<Table.Body>
					{ displayOrgsObject.map((org, i) => {
						totalVotes += org.votes || 0
						totalVotedMoney += org.votedTotal || 0
						totalPledges += org.pledgeTotal || 0
						totalAsk += org.ask || 0
						totalNeed += org.need || 0
						const topOrg = topOrgs.some(tOrg => tOrg._id === org._id)
						return (
							<Table.Row key={ org._id } positive={ topOrg }>
								<Table.Cell>{ org.title }</Table.Cell>
								<Table.Cell>{ org.votes }</Table.Cell>
								<Table.Cell>{ org.votedTotal }</Table.Cell>
								<Table.Cell>{ numeral(org.pledgeTotal / 2).format('$0,0') }</Table.Cell>
								<Table.Cell>{ numeral(org.ask).format('$0,0') }</Table.Cell>
								<Table.Cell>{ numeral(org.need).format('$0,0') }</Table.Cell>
							</Table.Row>
						)
					}) }
				</Table.Body>
				<Table.Footer>
					<Table.Row>
						<Table.HeaderCell textAlign='right' verticalAlign='top'><b>Totals:</b></Table.HeaderCell>
						<Table.HeaderCell verticalAlign='top'>
							{ showAllOrgs && <div style={ { whiteSpace: 'nowrap' } }>
								<span>{ totalVotes }</span>
								{ settings.useKioskChitVoting && ` / ${theme.totalChitVotes}`}
							</div> }
						</Table.HeaderCell>
						<Table.HeaderCell verticalAlign='top'>{ numeral(totalVotedMoney).format('$0,0') }</Table.HeaderCell>
						<Table.HeaderCell verticalAlign='top'>
							<b>{ numeral(totalPledges).format('$0,0') }</b><br />
							({ numeral(totalPledges * 2).format('$0,0') })
						</Table.HeaderCell>
						<Table.HeaderCell verticalAlign='top'>{ numeral(totalAsk).format('$0,0') }</Table.HeaderCell>
						<Table.HeaderCell verticalAlign='top'>{ numeral(totalNeed).format('$0,0') }</Table.HeaderCell>
					</Table.Row>
				</Table.Footer>
			</Table>
		</>
	)
})

const FlexHeading = styled.div`
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;

	span.full {
		flex: 1;
	}
`

export default ChitVotingPane
