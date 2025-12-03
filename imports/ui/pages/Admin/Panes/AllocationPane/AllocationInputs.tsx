import FavoriteIcon from "@mui/icons-material/Favorite"
import {
	Stack,
	TableRow,
	TableCell,
	TextField,
	Tooltip,
} from "@mui/material"
import numeral from "numeral"
import { FocusEvent, useState } from "react"
import { useSettings, type OrganizationWithComputed } from "/imports/api/hooks"
import { OrganizationMethods } from "/imports/api/methods"
import TopOffButton from "/imports/ui/components/Buttons/TopOffButton"

interface TabInfo {
	index: number
	length: number
}

interface AllocationInputsProps {
	org: OrganizationWithComputed
	crowdFavorite?: boolean
	tabInfo?: TabInfo
	hideAdminFields?: boolean
}

const AllocationInputs = ({ org, crowdFavorite, tabInfo, hideAdminFields }: AllocationInputsProps) => {
	const { settings } = useSettings()

	const [ votedAmount, setVotedAmount ] = useState<number | string>(org.votedTotal)

	const enterAmountFromVotes = async (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const value = e.target.value
		await OrganizationMethods.update.callAsync({ id: org._id, data: {
			amountFromVotes: parseInt(value) || 0,
		} })
	}

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
				{ hideAdminFields || settings?.useKioskFundsVoting ?
					<span>{ numeral(org.votedTotal).format("$0,0") }</span>
					:
					<TextField
						type="number"
						value={ votedAmount || "" }
						onChange={ e => setVotedAmount(e.target.value === "" ? "" : e.target.value) }
						onBlur={ enterAmountFromVotes }
						tabIndex={ tabInfo?.index }
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
					{ crowdFavorite && <TopOffButton orgs={ org } /> }
				</TableCell>
			}
		</TableRow>
	)
}

export default AllocationInputs
