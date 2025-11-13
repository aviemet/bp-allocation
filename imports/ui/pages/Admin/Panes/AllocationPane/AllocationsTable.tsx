import {
	Table,
	TableContainer,
	TableHead,
	TableBody,
	TableFooter,
	TableRow,
	TableCell,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import numeral from "numeral"

import AllocationInputs from "./AllocationInputs"
import { useSettings, useTheme, useOrgs } from "/imports/api/hooks"
import { Loading } from "/imports/ui/components"

interface AllocationsTableProps {
	hideAdminFields?: boolean
}

const AllocationsTable = ({ hideAdminFields = false }: AllocationsTableProps) => {
	const { settings } = useSettings()
	const { theme, themeLoading } = useTheme()
	const { topOrgs, orgsLoading } = useOrgs()

	const _calculateCrowdFavorite = () => {
		let favorite = 0

		topOrgs.forEach((org, i) => {
			const favoriteAmount = topOrgs[favorite].votedTotal
			if(org.votedTotal > favoriteAmount) {
				favorite = i
			}
		})
		return favorite
	}

	if(themeLoading || orgsLoading) return <Loading />

	interface ThemeWithComputed {
		fundsVotesCast?: number
		totalMembers?: number
	}
	const themeWithComputed = theme as ThemeWithComputed | undefined

	return (
		<TableContainer>
			<StyledTable>
				<TableHead>
					<TableRow>
						<TableCell width="30%"></TableCell>
						<TableCell>Voted Amount</TableCell>
						<TableCell>Funded</TableCell>
						<TableCell>Ask</TableCell>
						<TableCell>Need</TableCell>
						{ !hideAdminFields && <TableCell></TableCell> }
					</TableRow>
				</TableHead>

				<TableBody>
					{ topOrgs.map((org, i) => (
						<AllocationInputs
							key={ org._id }
							org={ org }
							crowdFavorite={ (i === _calculateCrowdFavorite()) }
							tabInfo={ { index: i + 1, length: topOrgs.length } }
							hideAdminFields={ hideAdminFields }
						/>
					)) }
				</TableBody>

				<TableFooter>
					<TableRow>
						<TableCell>Totals:</TableCell>

						{ /* Voted Amount */ }
						<TableCell>{
							numeral(topOrgs.reduce((sum, org) => { return sum + org.votedTotal }, 0)).format("$0,0")
						}</TableCell>

						{ /* Total Allocated */ }
						<TableCell>{
							numeral(topOrgs.reduce((sum, org) => { return sum + org.allocatedFunds + org.leverageFunds }, 0)).format("$0,0")
						}</TableCell>

						{ /* Original Ask */ }
						<TableCell>{
							numeral(topOrgs.reduce((sum, org) => { return sum + org.ask }, 0)).format("$0,0")
						}</TableCell>

						{ /* Need (Difference remaining) */ }
						<TableCell>{
							numeral(topOrgs.reduce((sum, org) => { return sum + org.need - org.leverageFunds }, 0)).format("$0,0")
						}</TableCell>

						{ !hideAdminFields && <TableCell>
							{ settings?.useKioskFundsVoting && themeWithComputed && themeWithComputed.fundsVotesCast !== undefined && themeWithComputed.totalMembers !== undefined && <>
								{ `(${themeWithComputed.fundsVotesCast}/${themeWithComputed.totalMembers})` } <span style={ { fontSize: "0.75em" } }>Members Voted</span>
							</> }
						</TableCell> }

					</TableRow>
				</TableFooter>
			</StyledTable>
		</TableContainer>
	)
}

const fontSize = "1.1rem"
const StyledTable = styled(Table)(({ theme }) => ({
	tableLayout: "fixed",
	"& > thead": {
		backgroundColor: "transparent",
		th: {
			fontSize: fontSize,
			textAlign: "center",
			backgroundColor: theme.palette.grey[200],
			border: `1px solid ${theme.palette.grey[300]}`,
			"&:first-of-type": {
				backgroundColor: "transparent",
				border: "none",
			},
		},
	},
	"& > tbody": {
		tr:{
			"td": {
				border: `1px solid ${theme.palette.grey[300]}`,
				fontSize: fontSize,
			},
			"&:nth-of-type(2n+1) td:first-of-type": {
				backgroundColor: theme.palette.grey[200],
			},
			"&:nth-of-type(2n) td:first-of-type": {
				backgroundColor: theme.palette.grey[100],
			},
		},
	},
	"& > tfoot": {
		"td": {
			border: `1px solid ${theme.palette.grey[300]}`,
			fontSize: fontSize,
			"&:first-of-type": {
				border: "none",
			},
		},
	},
}))

export default AllocationsTable
