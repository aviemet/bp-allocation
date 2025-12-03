import {
	Box,
	Stack,
	Table,
	TableContainer,
	TableHead,
	TableBody,
	TableFooter,
	TableRow,
	TableCell,
} from "@mui/material"
import { styled } from "@mui/material/styles"

import { roundFloat } from "/imports/lib/utils"
import { useSettings, useTheme, useOrgs } from "/imports/api/hooks"
import { Loading, MoneyCell } from "/imports/ui/components"
import ExportMemberVotes from "/imports/ui/components/Buttons/ExportMemberVotes"
import ExportTopups from "/imports/ui/components/Buttons/ExportTopups"
import ExportChitVotes from "/imports/ui/components/Buttons/ExportChitVotes"

const Overview = () => {
	const { settings, settingsLoading } = useSettings()
	const { theme, themeLoading } = useTheme()
	const { orgs, topOrgs, orgsLoading } = useOrgs()

	if(themeLoading || orgsLoading || settingsLoading || !theme) return <Loading />

	const topOrgIds = new Set(topOrgs.map(org => org._id))
	const remainingOrgs = orgs.filter(org => !topOrgIds.has(org._id))

	const sortedTopOrgs = [...topOrgs].sort((a, b) => b.votes - a.votes)
	const sortedRemainingOrgs = [...remainingOrgs].sort((a, b) => b.votes - a.votes)

	const renderOrgRow = (org: typeof orgs[0], isTopOrg: boolean) => {
		const consolationValue = isTopOrg
			? 0
			: (theme.consolationActive ? (theme.consolationAmount || 0) : 0)

		return (
			<TableRow key={ org._id }>
				<TableCell>
					<Box>{ org.title }</Box>
				</TableCell>
				<TableCell align="center">{ roundFloat(String(org.votes), 1) }</TableCell>
				<MoneyCell>{ org.votedTotal || 0 }</MoneyCell>
				<MoneyCell>{ consolationValue }</MoneyCell>
				<MoneyCell>{ org.topOff }</MoneyCell>
				<MoneyCell>{ org.pledges?.reduce((sum, pledge) => sum + pledge.amount, 0) || 0 }</MoneyCell>
				<MoneyCell>{ org.leverageFunds }</MoneyCell>
				<MoneyCell>{ org.allocatedFunds + org.leverageFunds + consolationValue }</MoneyCell>
			</TableRow>
		)
	}

	return (
		<>
			<TableContainer style={ {
				minWidth: 1005,
				overflow: "auto",
			} }>
				<StyledTable>
					<TableHead>
						<TableRow>
							<TableCell></TableCell>
							<TableCell colSpan={ 2 }>Votes</TableCell>
							<TableCell colSpan={ 5 } sx={ { backgroundColor: "transparent" } }>
								<Stack direction="row" justifyContent="space-around" alignItems="center">
									<ExportMemberVotes />
									<ExportTopups />
									<ExportChitVotes />
								</Stack>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell></TableCell>
							<TableCell>R1 (chits)<br/>{ settings?.useKioskChitVoting && `[${theme.chitVotesCast}/${theme.totalMembers}]` }</TableCell>
							<TableCell>R2 ($)<br/>{ settings?.useKioskFundsVoting && `[${theme.fundsVotesCast}/${theme.totalMembers}]` }</TableCell>
							<TableCell>Consolation</TableCell>
							<TableCell>Top Off</TableCell>
							<TableCell>Pledges (x{ theme.matchRatio })</TableCell>
							<TableCell>Leverage</TableCell>
							<TableCell>Total<br/>Allocated</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{ sortedTopOrgs.map((org) => renderOrgRow(org, true)) }
						{ sortedRemainingOrgs.length > 0 && (
							<TableRow>
								<TableCell colSpan={ 8 } sx={ {
									backgroundColor: "rgba(0, 0, 0, 0.1)",
									borderTop: "2px solid rgba(0, 0, 0, 0.2)",
									borderBottom: "2px solid rgba(0, 0, 0, 0.2)",
									height: "4px",
									padding: 0,
								} }></TableCell>
							</TableRow>
						) }
						{ sortedRemainingOrgs.map((org) => renderOrgRow(org, false)) }
					</TableBody>

					<TableFooter>
						<TableRow>

							<TableCell>Totals:</TableCell>

							{ /* Chit Votes */ }
							<TableCell>{
								roundFloat(orgs.reduce((sum, org) => sum + org.votes, 0), 1)
							}</TableCell>

							{ /* $ Votes */ }
							<MoneyCell>{
								orgs.reduce((sum, org) => sum + org.votedTotal, 0)
							// numeral(totals.get('votedTotal')).format('$0,0')
							}</MoneyCell>

							{ /* Consolation */ }
							<MoneyCell>{
								theme.consolationActive ? (sortedRemainingOrgs.length * (theme.consolationAmount || 0)) : 0
							}</MoneyCell>

							{ /* Topoff */ }
							<MoneyCell>{
								orgs.reduce((sum, org) => sum + org.topOff, 0)
							}</MoneyCell>

							{ /* Pledges */ }
							<MoneyCell>{
								orgs.reduce((finalSum, org) => {
									return finalSum + (org.pledges?.reduce((sum, pledge) => sum + pledge.amount, 0) || 0)
								}, 0)
							}</MoneyCell>

							{ /* Leverage */ }
							<MoneyCell>{ Number(theme.leverageRemaining || 0) }</MoneyCell>

							{ /* Total Allocated */ }
							<MoneyCell>{
								orgs.reduce((sum, org) => {
									const isTopOrg = topOrgIds.has(org._id)
									const consolationValue = isTopOrg
										? 0
										: (theme.consolationActive ? (theme.consolationAmount || 0) : 0)
									return sum + org.allocatedFunds + org.leverageFunds + consolationValue
								}, 0)
							// numeral(totals.get('allocatedFunds')).format('$0,0')
							}</MoneyCell>

						</TableRow>
						<TableRow>
							<TableCell colSpan={ 6 }></TableCell>
							<TableCell align="right">Total Given:</TableCell>
							<MoneyCell>{
								orgs.reduce(
									(sum, org) => sum + (org.pledgeTotal / 2),
									Number(
										(theme.leverageTotal || 0) +
										(theme.saves?.reduce((sum, save) => {return sum + (save.amount || 0)}, 0) || 0) +
										(settings?.resultsOffset || 0)
									)
								)
							}</MoneyCell>
						</TableRow>
					</TableFooter>
				</StyledTable>
			</TableContainer>

		</>
	)
}

const fontSize = "1rem"
const StyledTable = styled(Table)(({ theme }) => ({
	tableLayout: "fixed",
	width: "calc(100% - 1px)",
	"& > thead": {
		backgroundColor: "transparent",
		tr: {
			// First row, third th
			"&:first-of-type th:nth-of-type(3)": {
				backgroundColor: "transparent",
				border: "none",
			},
			// Second row th
			"&:nth-of-type(2) th": {
				minWidth: "11%",
			},
		},
		th: {
			fontSize: fontSize,
			textAlign: "center",
			backgroundColor: theme.palette.grey[200],
			border: `1px solid ${theme.palette.grey[300]}`,
			padding: "16px 8px",
			"&:first-of-type": {
				backgroundColor: "transparent",
				border: "none",
				width: "23%",
			},
			"&:nth-of-type(2)": {
				width: "18%",
			},
		},
	},
	"& > tbody": {
		tr:{
			"td": {
				border: `1px solid ${theme.palette.grey[300]}`,
				fontSize: "0.9rem",
				padding: "8px",
			},
			"&:nth-of-type(2n) td:first-of-type": {
				backgroundColor: theme.palette.grey[200],
			},
			"&:nth-of-type(2n+1) td:first-of-type": {
				backgroundColor: theme.palette.grey[100],
			},
		},
	},
	"& > tfoot": {
		"td": {
			backgroundColor: theme.palette.grey[200],
			border: `1px solid ${theme.palette.grey[300]}`,
			fontSize: fontSize,
			padding: "16px 8px",
			"&:first-of-type": {
				backgroundColor: "transparent",
				border: "none",
			},
		},
		"tr:nth-of-type(2) td": {
			"&:first-of-type": {
				backgroundColor: "transparent",
				border: "none",
			},
			backgroundColor: theme.palette.primary.main,
			color: theme.palette.primary.contrastText,
		},
	},
}))

export default Overview
