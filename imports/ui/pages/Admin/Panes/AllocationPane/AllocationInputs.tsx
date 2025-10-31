import { useState } from "react"
import PropTypes from "prop-types"
import numeral from "numeral"

import { observer } from "mobx-react-lite"
import { useSettings } from "/imports/api/providers"

import { OrganizationMethods } from "/imports/api/methods"

import {
	Button,
	Stack,
	TableRow,
	TableCell,
	TextField,
	Tooltip,
} from "@mui/material"
import FavoriteIcon from "@mui/icons-material/Favorite"

const AllocationInputs = observer(({ org, crowdFavorite, tabInfo, hideAdminFields }) => {
	const { settings } = useSettings()

	const [ votedAmount, setVotedAmount ] = useState(org.votedTotal)

	// Controlling input only visible if not in kiosk voting mode
	const enterAmountFromVotes = e => {
		OrganizationMethods.update.call({ id: org._id, data: {
			amountFromVotes: parseInt(e.target.value),
		} })
	}

	const handleTopoff = () => {
		const amount = org.topOff > 0 ? 0 : org.need - org.leverageFunds

		OrganizationMethods.update.call({ id: org._id, data: { topOff: amount } })
	}

	// Boolean help for marking fully funded orgs
	const reachedGoal = org.need - org.leverageFunds <= 0
	return (
		<TableRow className={ reachedGoal ? "make-me-stand-out" : "" }>

			{ /* Org Title */ }
			<TableCell>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					{ org.title }
					{ crowdFavorite && <Tooltip title="Crowd Favorite"><FavoriteIcon color="success" /></Tooltip> }
				</Stack>
			</TableCell>

			{ /* Voted Amount Input */ }
			<TableCell align="right">
				{ hideAdminFields || settings.useKioskFundsVoting ?
					<span>{ numeral(org.votedTotal || 0).format("$0,0") }</span>
					:
					<TextField
						type="number"
						value={ votedAmount || "" }
						onChange={ e => setVotedAmount(e.target.value === "" ? 0 : e.target.value) }
						onBlur={ enterAmountFromVotes }
						tabIndex={ tabInfo ? tabInfo.index : false }
					/>
				}
			</TableCell>

			{ /* Funded */ }
			<TableCell className={ reachedGoal ? "bold" : "" } align="right">
				{ numeral(org.allocatedFunds + org.leverageFunds).format("$0,0") }
			</TableCell>

			{ /* Ask */ }
			<TableCell className={ reachedGoal ? "bold" : "" } align="right">
				{ numeral(org.ask).format("$0,0") }
			</TableCell>

			{ /* Need */ }
			<TableCell align="right">
				{ numeral(org.need - org.leverageFunds).format("$0,0") }
			</TableCell>

			{ /* Actions */ }
			{ !hideAdminFields &&
				<TableCell>
					<Button
						onClick={ handleTopoff }
						color={ crowdFavorite ? "primary" : "grey" }
						sx={ {
							width: "100%",
							whiteSpace: "nowrap",
						} }
					>
						{ org.topOff > 0 ? "Undo " : "" }Top Off
					</Button>
				</TableCell>
			}
		</TableRow>
	)
})

AllocationInputs.propTypes = {
	org: PropTypes.object,
	crowdFavorite: PropTypes.bool,
	tabInfo: PropTypes.object,
	hideAdminFields: PropTypes.bool,
}

export default AllocationInputs
