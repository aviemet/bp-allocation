import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import numeral from 'numeral'

import { observer } from 'mobx-react-lite'

import { Grid, Table, Button, Header, Loader } from 'semantic-ui-react'

import Breakdown from './Breakdown'
import AllocationInputs from './AllocationInputs'
import Pledges from './Pledges'

import { ShowLeverageToggle } from '/imports/ui/Components/Toggles'
import { useSettings, useTheme, useOrgs } from '/imports/api/providers'

const AllocationPane = observer(props => {
	const { settings } = useSettings()
	const { theme, isLoading: themeLoading } = useTheme()
	const { topOrgs, isLoading: orgsLoading } = useOrgs()

	const _calculateCrowdFavorite = () => {
		let favorite = 0

		topOrgs.map((org, i) => {
			let favoriteAmount = topOrgs[favorite].votedTotal || 0
			if(org.votedTotal > favoriteAmount) {
				favorite = i
			}
		})
		return favorite
	}

	if(themeLoading || orgsLoading) return <Loader active />
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
					<Header as='h2'>Top { topOrgs.length } Funds Allocation</Header>
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
								<Table.HeaderCell>Funded</Table.HeaderCell>
								<Table.HeaderCell>Ask</Table.HeaderCell>
								<Table.HeaderCell>Need</Table.HeaderCell>
								{ !props.hideAdminFields && <Table.HeaderCell collapsing></Table.HeaderCell> }
							</Table.Row>
						</Table.Header>

						<Table.Body>
							{ topOrgs.map((org, i) => (
								<AllocationInputs
									key={ i }
									org={ org }
									theme={ theme }
									crowdFavorite={ (i === _calculateCrowdFavorite()) }
									tabInfo={ { index: i + 1, length: topOrgs.length } }
									hideAdminFields={ props.hideAdminFields || false }
								/>
							)) }
						</Table.Body>

						<Table.Footer>
							<Table.Row textAlign='right' className='bold'>

								<Table.HeaderCell>Totals:</Table.HeaderCell>

								{/* Voted Amount */}
								<Table.HeaderCell>{
									numeral(topOrgs.reduce((sum, org) => { return sum + org.votedTotal }, 0)).format('$0,0')
								}</Table.HeaderCell>

								{/* Total Allocated */}
								<Table.HeaderCell>{
									numeral(topOrgs.reduce((sum, org) => { return sum + org.allocatedFunds }, 0)).format('$0,0')
								}</Table.HeaderCell>

								{/* Original Ask*/}
								<Table.HeaderCell>{
									numeral(topOrgs.reduce((sum, org) => { return sum + org.ask }, 0)).format('$0,0')
								}</Table.HeaderCell>

								{/* Need (Difference remaining) */}
								<Table.HeaderCell>{
									numeral(topOrgs.reduce((sum, org) => { return sum + org.need - org.leverageFunds }, 0)).format('$0,0')
								}</Table.HeaderCell>

								{ !props.hideAdminFields &&  <Table.HeaderCell>
									{ settings.useKioskFundsVoting && <>
										{`(${theme.fundsVotesCast}/${theme.totalMembers})`} <span style={ { fontSize: '0.75em' } }>Members Voted</span>
									</> }
								</Table.HeaderCell> }

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
	)

})

AllocationPane.propTypes = {
	hideAdminFields: PropTypes.bool
}

export default AllocationPane
