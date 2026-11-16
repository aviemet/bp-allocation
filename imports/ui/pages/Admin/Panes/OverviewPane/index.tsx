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

import {
	overviewAllocatedTotal,
	overviewConsolationAmount,
	sumOverviewAllocatedTotal,
	sumOverviewChitVotes,
	sumOverviewConsolationTotal,
	sumOverviewVotedTotal,
} from "/imports/lib/allocation/displayTotals"
import { poolMatch, rawPledgeTotal, sumRawPledgeTotal, sumTopOff } from "/imports/lib/allocation/orgPledges"
import { roundFloat } from "/imports/lib/utils"
import { useSettings, useTheme, useOrgs, type OrgDataWithComputed } from "/imports/api/hooks"
import { ExportChitVotes, ExportMemberVotes, ExportPledges } from "/imports/ui/components/Buttons"
import { Loading, MoneyCell } from "/imports/ui/components"
import { type ThemeWithComputed } from "/imports/types/themeWithComputed"

type OverviewOrgTableRowProps = {
	org: OrgDataWithComputed
	isTopOrg: boolean
	theme: ThemeWithComputed
	topOrgIds: Set<string>
}

const OverviewOrgTableRow = ({ org, isTopOrg, theme, topOrgIds }: OverviewOrgTableRowProps) => {
	return (
		<TableRow>
			<TableCell>
				<Box>{ org.title }</Box>
			</TableCell>
			<TableCell align="center">{ roundFloat(String(org.votes), 1) }</TableCell>
			<MoneyCell>{ org.votedTotal || 0 }</MoneyCell>
			<MoneyCell>{ overviewConsolationAmount(isTopOrg, theme) }</MoneyCell>
			<MoneyCell>{ org.topOff }</MoneyCell>
			<MoneyCell>{ rawPledgeTotal(org) || 0 }</MoneyCell>
			<MoneyCell>{ poolMatch(org, theme, topOrgIds) }</MoneyCell>
			<MoneyCell>{ org.leverageFunds }</MoneyCell>
			<MoneyCell>{ overviewAllocatedTotal(org, theme, isTopOrg) }</MoneyCell>
		</TableRow>
	)
}

export const Overview = () => {
	const { settings, settingsLoading } = useSettings()
	const { theme, themeLoading } = useTheme()
	const { orgs, topOrgs, orgsLoading } = useOrgs()

	if(themeLoading || orgsLoading || settingsLoading || !theme) return <Loading />

	const topOrgIds = new Set(topOrgs.map(org => org._id))
	const totalAllocated = sumOverviewAllocatedTotal(orgs, theme, topOrgIds)
	const footerTotals = {
		chitVotes: sumOverviewChitVotes(orgs),
		votedTotal: sumOverviewVotedTotal(orgs),
		consolation: sumOverviewConsolationTotal(orgs, theme, topOrgIds),
		topOff: sumTopOff(orgs),
		pledges: sumRawPledgeTotal(orgs),
	}
	const remainingOrgs = orgs.filter(org => !topOrgIds.has(org._id))

	const sortedTopOrgs = [...topOrgs].sort((a, b) => b.votes - a.votes)
	const sortedRemainingOrgs = [...remainingOrgs].sort((a, b) => b.votes - a.votes)

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
							<TableCell colSpan={ 6 } sx={ { backgroundColor: "transparent" } }>
								<Stack direction="row" sx={ { justifyContent: "space-around", alignItems: "center" } }>
									<ExportMemberVotes />
									<ExportPledges />
									<ExportChitVotes />
								</Stack>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell></TableCell>
							<TableCell>R1 (chits)<br/>{ settings?.useKioskChitVoting && `[${theme.chitVotesCast}/${theme.totalMembers}]` }</TableCell>
							<TableCell>R2 ($)<br/>{ settings?.useKioskFundsVoting && `[${theme.fundsVotesCast}/${theme.totalMembers}]` }</TableCell>
							<TableCell>Consolation</TableCell>
							<TableCell>Crowd Fav</TableCell>
							<TableCell>Pledges</TableCell>
							<TableCell>Pledge<br/>Matches</TableCell>
							<TableCell>Leverage<br/>Spread</TableCell>
							<TableCell>Total<br/>Allocated</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{ sortedTopOrgs.map(org => (
							<OverviewOrgTableRow
								key={ org._id }
								org={ org }
								isTopOrg
								theme={ theme }
								topOrgIds={ topOrgIds }
							/>
						)) }
						{ sortedRemainingOrgs.length > 0 && (
							<TableRow>
								<TableCell colSpan={ 9 } sx={ {
									backgroundColor: "rgba(0, 0, 0, 0.1)",
									borderTop: "2px solid rgba(0, 0, 0, 0.2)",
									borderBottom: "2px solid rgba(0, 0, 0, 0.2)",
									height: "4px",
									padding: 0,
								} }></TableCell>
							</TableRow>
						) }
						{ sortedRemainingOrgs.map(org => (
							<OverviewOrgTableRow
								key={ org._id }
								org={ org }
								isTopOrg={ false }
								theme={ theme }
								topOrgIds={ topOrgIds }
							/>
						)) }
					</TableBody>

					<TableFooter>
						<TableRow>

							<TableCell>Totals:</TableCell>

							{ /* Chit Votes */ }
							<TableCell>{ footerTotals.chitVotes }</TableCell>

							{ /* $ Votes */ }
							<MoneyCell>{ footerTotals.votedTotal }</MoneyCell>

							{ /* Consolation */ }
							<MoneyCell>{ footerTotals.consolation }</MoneyCell>

							{ /* Crowd favorite full-funding */ }
							<MoneyCell>{ footerTotals.topOff }</MoneyCell>

							{ /* Pledges */ }
							<MoneyCell>{ footerTotals.pledges }</MoneyCell>

							<MoneyCell>{ theme.pledgeMatchTotal }</MoneyCell>

							{ /* Leverage */ }
							<MoneyCell>{ Number(theme.leverageRemaining || 0) }</MoneyCell>

							{ /* Total Allocated */ }
							<MoneyCell>{ totalAllocated }</MoneyCell>

						</TableRow>
						<TableRow>
							<TableCell colSpan={ 7 }></TableCell>
							<TableCell align="right">Total Given:</TableCell>
							<MoneyCell>{ totalAllocated }</MoneyCell>
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

