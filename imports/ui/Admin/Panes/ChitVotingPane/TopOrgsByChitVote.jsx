import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import { observer } from 'mobx-react-lite'
import { ThemeMethods } from '/imports/api/methods'
import { useSettings, useTheme, useOrgs } from '/imports/api/providers'

// import { sortTopOrgs } from '/imports/lib/utils'

import { Table, Icon, Input, Header } from 'semantic-ui-react'
import styled from 'styled-components'

import TopOrgsRow from './TopOrgsRow'
import ChitVotingActiveToggle from '/imports/ui/Components/Toggles/ChitVotingActiveToggle'
import { sortTopOrgs } from '/imports/lib/orgsMethods'

const TopOrgsByChitVote = observer(props => {
	const { settings } = useSettings()
	const { theme } = useTheme()
	const { orgs } = useOrgs()

	const updateNumTopOrgs = (e, data) => {
		if(data.value !== theme.numTopOrgs){
			ThemeMethods.update.call({
				id: theme._id,
				data: {
					numTopOrgs: data.value
				}
			})
		}
	}

	let sortedOrgs = sortTopOrgs(orgs.values, theme)
	let totalVotes = 0
	return (
		<>
			<Header as="h3" floated="right">
				<ChitVotingActiveToggle />
			</Header>

			<Header as="h1" floated="left">
				Top {!props.hideAdminFields ?
					<NumTopOrgsInput size='mini' type='number' value={ theme.numTopOrgs } onChange={ updateNumTopOrgs } width={ 1 } />
					:
					theme.numTopOrgs
				} Organizations
			</Header>

			<Table celled>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>
							<FlexHeading>
								<span className="full">Organization</span>
								<span>
									{ settings.useKioskChitVoting && `(${theme.chitVotesCast}/${theme.totalMembers}) Members Have Voted` }
								</span>
							</FlexHeading>
						</Table.HeaderCell>
						<Table.HeaderCell collapsing>Votes</Table.HeaderCell>
						<Table.HeaderCell collapsing><Icon name="lock" /></Table.HeaderCell>
					</Table.Row>
				</Table.Header>

				<Table.Body>
					{ sortedOrgs.map((org, i) => {
						const inTopOrgs = i < theme.numTopOrgs
						const _isLocked = theme.topOrgsManual.includes(org._id)
						const _isSaved = (_.findIndex(theme.saves, ['org', org._id]) >= 0)
						totalVotes += org.votes || 0

						return(
							<TopOrgsRow
								key={ i }
								inTopOrgs={ inTopOrgs }
								isLocked={ _isLocked }
								isSaved={ _isSaved }
								themeId={ theme._id }
								org={ org }
								hideAdminFields={ props.hideAdminFields || false }
							/>
						)

					}) }
				</Table.Body>
				<Table.Footer>
					<Table.Row>
						<Table.HeaderCell textAlign='right'>Total Votes:</Table.HeaderCell>
						<Table.HeaderCell>
							<div style={ { whiteSpace: 'nowrap' } }>
								<span>{ totalVotes }</span>
								{ settings.useKioskChitVoting && ` / ${theme.totalChitVotes}`}
							</div>
						</Table.HeaderCell>
						<Table.HeaderCell></Table.HeaderCell>
					</Table.Row>
				</Table.Footer>
			</Table>
		</>
	)
})

const NumTopOrgsInput = styled(Input)`
	width: 65px;

	&& input {
		padding: 0.3em 0.4em;
	}
`

const FlexHeading = styled.div`
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;

	span.full {
		flex: 1;
	}
`

TopOrgsByChitVote.propTypes = {
	hideAdminFields: PropTypes.bool
}

export default TopOrgsByChitVote
