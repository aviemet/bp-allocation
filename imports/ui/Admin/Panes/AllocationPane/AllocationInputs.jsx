import React, { useState } from 'react'
import PropTypes from 'prop-types'
import numeral from 'numeral'

import { observer } from 'mobx-react-lite'
import { useSettings } from '/imports/api/providers'

import { OrganizationMethods } from '/imports/api/methods'

import CrowdFavoriteRibbon from '/imports/ui/Components/CrowdFavoriteRibbon'

import { Table, Button, Input } from 'semantic-ui-react'

/**
 * Allocation Inputs Component
 */
const AllocationInputs = observer(props => {
	const { settings } = useSettings()

	const [ votedAmount, setVotedAmount ] = useState(props.org.votedTotal)

	// Controlling input only visible if not in kiosk voting mode
	const enterAmountFromVotes = e => {
		OrganizationMethods.update.call({ id: props.org._id, data: {
			amountFromVotes: parseInt(e.target.value)
		} })
	}

	const topoff = () => {
		const amount = props.org.topOff > 0 ? 0 : props.org.need - props.org.leverageFunds
		OrganizationMethods.update.call({ id: props.org._id, data: {
			topOff: amount
		} })
	}

	// Boolean help for marking fully funded orgs
	const reachedGoal = props.org.need - props.org.leverageFunds <= 0
	return (
		<Table.Row positive={ reachedGoal }>

			{/* Org Title */}
			<Table.Cell>
				<CrowdFavoriteRibbon crowdFavorite={ props.crowdFavorite || false }>
					{props.org.title}
				</CrowdFavoriteRibbon>
			</Table.Cell>

			{/* Voted Amount Input */}
			<Table.Cell textAlign="right">
				{ props.hideAdminFields || settings.useKioskFundsVoting ?
					<span>{ numeral(props.org.votedTotal || 0).format('$0,0') }</span>
					:
					<Input
						fluid
						type='number'
						value={ votedAmount || '' }
						onChange={ e => setVotedAmount(e.target.value === '' ? 0 : e.target.value) }
						onBlur={ enterAmountFromVotes }
						tabIndex={ props.tabInfo ? props.tabInfo.index : false }
					/>
				}
			</Table.Cell>

			{/* Funded */}
			<Table.Cell className={ reachedGoal ? 'bold' : '' } textAlign="right">
				{numeral(props.org.allocatedFunds).format('$0,0')}
			</Table.Cell>

			{/* Ask */}
			<Table.Cell className={ reachedGoal ? 'bold' : '' } textAlign="right">
				{numeral(props.org.ask).format('$0,0')}
			</Table.Cell>

			{/* Need */}
			<Table.Cell textAlign="right">
				{ numeral(props.org.need - props.org.leverageFunds).format('$0,0') }
			</Table.Cell>

			{/* Actions */}
			{ !props.hideAdminFields &&
			<Table.Cell singleLine>
				<Button onClick={ topoff } style={ { width: '100%' } }>{props.org.topOff > 0 ? 'Undo' : '' } Top Off</Button>
			</Table.Cell> }
		</Table.Row>
	)
})

AllocationInputs.propTypes = {
	org: PropTypes.object,
	crowdFavorite: PropTypes.bool,
	tabInfo: PropTypes.object,
	hideAdminFields: PropTypes.bool
}

export default AllocationInputs