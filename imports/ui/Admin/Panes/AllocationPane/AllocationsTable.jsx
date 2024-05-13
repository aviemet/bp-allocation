import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import numeral from 'numeral'
import { Map } from 'immutable'

import { observer } from 'mobx-react-lite'

import { styled } from '@mui/material/styles'
import {
	Grid,
	Table,
	TableContainer,
	TableHead,
	TableBody,
	TableFooter,
	TableRow,
	TableCell,
	TextField,
} from '@mui/material'

import AllocationInputs from './AllocationInputs'
import { useSettings, useTheme, useOrgs } from '/imports/api/providers'
import { Loading } from '/imports/ui/Components'

const emptyTotals = {
	votedTotal: 0,
	allocatedFunds: 0,
	ask: 0,
	need: 0,
}

const AllocationPane = observer(({ hideAdminFields = false }) => {
	const { settings } = useSettings()
	const { theme, isLoading: themeLoading } = useTheme()
	const { topOrgs, isLoading: orgsLoading } = useOrgs()

	// const [totals, setTotals] = useState(Map(emptyTotals))

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

	// This was a failed attempt to calculate totals in a singe loop, rather than 5 separate loops
	// useEffect(() => {
	// 	const newTotals = Object.assign(emptyTotals, {})
	// 	topOrgs.forEach(org => {
	// 		for(const [key, value] of Object.entries(newTotals)) {
	// 			newTotals[key] = org[key] + value

	// 			// Additional calculations besides basic summation per key
	// 			switch(key) {
	// 				case 'need':
	// 					newTotals.need -= org.leverageFunds
	// 					break
	// 				default:
	// 					break
	// 			}
	// 		}
	// 	})
	// 	setTotals(Map(newTotals))
	// }, [topOrgs, orgsLoading])

	if(themeLoading || orgsLoading) return <Loading />
	return (
		<TableContainer>
			<StyledTable variant="striped">
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
							key={ i }
							org={ org }
							theme={ theme }
							crowdFavorite={ (i === _calculateCrowdFavorite()) }
							tabInfo={ { index: i + 1, length: topOrgs.length } }
							hideAdminFields={ hideAdminFields || false }
						/>
					)) }
				</TableBody>

				<TableFooter>
					<TableRow align='right'>

						<TableCell>Totals:</TableCell>

						{/* Voted Amount */}
						<TableCell>{
							numeral(topOrgs.reduce((sum, org) => { return sum + org.votedTotal }, 0)).format('$0,0')
							// numeral(totals.get('votedTotal')).format('$0,0')
						}</TableCell>

						{/* Total Allocated */}
						<TableCell>{
							numeral(topOrgs.reduce((sum, org) => { return sum + org.allocatedFunds + org.leverageFunds }, 0)).format('$0,0')
							// numeral(totals.get('allocatedFunds')).format('$0,0')
						}</TableCell>

						{/* Original Ask*/}
						<TableCell>{
							numeral(topOrgs.reduce((sum, org) => { return sum + org.ask }, 0)).format('$0,0')
							// numeral(totals.get('ask')).format('$0,0')
						}</TableCell>

						{/* Need (Difference remaining) */}
						<TableCell>{
							numeral(topOrgs.reduce((sum, org) => { return sum + org.need - org.leverageFunds }, 0)).format('$0,0')
							// numeral(totals.get('need')).format('$0,0')
						}</TableCell>

						{ !hideAdminFields &&  <TableCell>
							{ settings.useKioskFundsVoting && <>
								{`(${theme.fundsVotesCast}/${theme.totalMembers})`} <span style={ { fontSize: '0.75em' } }>Members Voted</span>
							</> }
						</TableCell> }

					</TableRow>
				</TableFooter>
			</StyledTable>
		</TableContainer>
	)
})

const fontSize = '1.1rem'
const StyledTable = styled(Table)(({ theme }) => ({
	tableLayout: 'fixed',
	'& > thead': {
		backgroundColor: 'transparent',
		th: {
			fontSize: fontSize,
			textAlign: 'center',
			backgroundColor: theme.palette.grey[200],
			border: `1px solid ${theme.palette.grey[300]}`,
			'&:first-of-type': {
				backgroundColor: 'transparent',
				border: 'none',
			},
		},
	},
	'& > tbody': {
		tr:{
			'td': {
				border: `1px solid ${theme.palette.grey[300]}`,
				fontSize: fontSize,
			},
			'&:nth-of-type(2n+1) td:first-of-type': {
				backgroundColor: theme.palette.grey[200],
			},
			'&:nth-of-type(2n) td:first-of-type': {
				backgroundColor: theme.palette.grey[100],
			},
		},
	},
	'& > tfoot': {
		'td': {
			border: `1px solid ${theme.palette.grey[300]}`,
			fontSize: fontSize,
			'&:first-of-type': {
				border: 'none',
			},
		},
	},
}))

AllocationPane.propTypes = {
	hideAdminFields: PropTypes.bool
}

export default AllocationPane
