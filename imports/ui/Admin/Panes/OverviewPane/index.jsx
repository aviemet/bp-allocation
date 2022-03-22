import React from 'react'
import numeral from 'numeral'
import { findIndex } from 'lodash'

import { styled } from '@mui/material/styles'
import  {
	Box,
	Chip,
	Stack,
	Table,
	TableContainer,
	TableHead,
	TableBody,
	TableFooter,
	TableRow,
	TableCell,
} from '@mui/material'

import { roundFloat } from '/imports/lib/utils'
import { useSettings, useTheme, useOrgs } from '/imports/api/providers'
import { Loading, MoneyCell } from '/imports/ui/Components'
import ExportMemberVotes from '/imports/ui/Components/Buttons/ExportMemberVotes'
import ExportTopups from '/imports/ui/Components/Buttons/ExportTopups'

const Overview = () => {
	const { settings } = useSettings()
	const { theme, isLoading: themeLoading } = useTheme()
	const { topOrgs, isLoading: orgsLoading } = useOrgs()

	if(themeLoading || orgsLoading) return <Loading />
	return (
		<TableContainer>
			<StyledTable variant="striped">
				<TableHead>
					<TableRow>
						<TableCell></TableCell>
						<TableCell colSpan={ 2 }>Votes</TableCell>
						<TableCell colSpan={ 5 } sx={ { backgroundColor: 'transparent' } }>
							<Stack direction="row" justifyContent="space-around" alignItems="center">
								<ExportMemberVotes />
								<ExportTopups />
							</Stack>
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell></TableCell>
						<TableCell>R1<br/>{ settings.useKioskChitVoting && `(${theme.chitVotesCast}/${theme.totalMembers})` }</TableCell>
						<TableCell>R2<br/>{ settings.useKioskFundsVoting && `(${theme.fundsVotesCast}/${theme.totalMembers})` }</TableCell>
						<TableCell>Saves</TableCell>
						<TableCell>Top Off</TableCell>
						<TableCell>Pledges</TableCell>
						<TableCell>Leverage</TableCell>
						<TableCell>Total<br/>Allocated</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{ topOrgs.map((org, i) => {
						const saveIndex = findIndex(theme.saves, ['org', org._id])
						return(
							<TableRow key={ i }>
								<TableCell>
									<Box>{ org.title }</Box>
									<Box sx={ { textAlign: 'right' } }><Chip label={ `Ask: ${numeral(org.ask).format('$0,0')}` } /></Box>
								</TableCell>
								<TableCell align="right">{ roundFloat(org.votes, 1) }</TableCell>
								<MoneyCell>{ org.votedTotal || 0 }</MoneyCell>
								<MoneyCell>{ saveIndex >= 0 ? theme.saves[saveIndex] : 0 }</MoneyCell>
								<MoneyCell>{ org.topOff }</MoneyCell>
								<MoneyCell>{ org.pledges.reduce((sum, pledge) => sum + pledge.amount, 0) }</MoneyCell>
								<MoneyCell>{ org.leverageFunds }</MoneyCell>
								<MoneyCell>{ org.allocatedFunds + org.leverageFunds }</MoneyCell>
							</TableRow>
						)
					}) }
				</TableBody>

				<TableFooter>
					<TableRow align='right'>

						<TableCell>Totals:</TableCell>

						{/* Chit Votes */}
						<TableCell>{
							roundFloat(topOrgs.reduce((sum, org) => sum + org.votes, 0), 1)
						}</TableCell>

						{/* $ Votes */}
						<MoneyCell>{
							topOrgs.reduce((sum, org) => sum + org.votedTotal, 0)
							// numeral(totals.get('votedTotal')).format('$0,0')
						}</MoneyCell>

						{/* Saves */}
						<MoneyCell>{
							theme.saves.reduce((sum, save) => sum + save, 0)
						}</MoneyCell>

						{/* Topoff */}
						<MoneyCell>{
							topOrgs.reduce((sum, org) => sum + org.topOff, 0)
						}</MoneyCell>

						{/* Pledges */}
						<MoneyCell>{
							topOrgs.reduce((finalSum, org) => {
								return finalSum + org.pledges.reduce((sum, pledge) => sum + pledge.amount, 0)
							}, 0)
						}</MoneyCell>

						{/* Leverage */}
						<MoneyCell>{ theme.leverageRemaining }</MoneyCell>

						{/* Total Allocated */}
						<MoneyCell>{
							topOrgs.reduce((sum, org) => sum + org.allocatedFunds + org.leverageFunds, 0)
							// numeral(totals.get('allocatedFunds')).format('$0,0')
						}</MoneyCell>

					</TableRow>
					<TableRow>
						<TableCell colSpan={ 6 }></TableCell>
						<TableCell align="right">Total Given:</TableCell>
						<MoneyCell>{
							topOrgs.reduce(
								(sum, org) => sum + (org.pledgeTotal / 2),
								parseFloat(
									(theme.leverageTotal || 0) +
									theme.saves.reduce((sum, save) => {return sum + save.amount}, 0) +
									(settings.resultsOffset || 0)
								)
							)
						}</MoneyCell>
					</TableRow>
				</TableFooter>
			</StyledTable>
		</TableContainer>
	)
}

const fontSize = '1.1rem'
const StyledTable = styled(Table)(({ theme }) => ({
	tableLayout: 'fixed',
	width: 'calc(100% - 1px)',
	'& > thead': {
		backgroundColor: 'transparent',
		tr: {
			// First row, third th
			'&:first-of-type th:nth-of-type(3)': {
				backgroundColor: 'transparent',
				border: 'none',
			},
			// Second row th
			'&:nth-of-type(2) th': {
				minWidth: '11%',
			},
		},
		th: {
			fontSize: fontSize,
			textAlign: 'center',
			backgroundColor: theme.palette.grey[200],
			border: `1px solid ${theme.palette.grey[300]}`,
			padding: '16px 8px',
			'&:first-of-type': {
				backgroundColor: 'transparent',
				border: 'none',
				width: '23%',
			},
			'&:nth-of-type(2)': {
				width: '17%',
			},
		},
	},
	'& > tbody': {
		tr:{
			'td': {
				border: `1px solid ${theme.palette.grey[300]}`,
				fontSize: fontSize,
				padding: '8px',
			},
			'&:nth-of-type(2n) td:first-of-type': {
				backgroundColor: theme.palette.grey[200],
			},
			'&:nth-of-type(2n+1) td:first-of-type': {
				backgroundColor: theme.palette.grey[100],
			},
		},
	},
	'& > tfoot': {
		'td': {
			backgroundColor: theme.palette.grey[200],
			border: `1px solid ${theme.palette.grey[300]}`,
			fontSize: fontSize,
			padding: '16px 8px',
			'&:first-of-type': {
				backgroundColor: 'transparent',
				border: 'none',
			},
		},
		'tr:nth-of-type(2) td': {
			'&:first-of-type': {
				backgroundColor: 'transparent',
				border: 'none',
			},
			backgroundColor: theme.palette.primary.main,
			color: theme.palette.primary.contrastText,
		}
	},
}))

export default Overview
