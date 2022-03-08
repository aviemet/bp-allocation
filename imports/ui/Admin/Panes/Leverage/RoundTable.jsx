import React from 'react'
import PropTypes from 'prop-types'
import numeral from 'numeral'

import {
	CircularProgress,
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
import { Icon } from 'semantic-ui-react'

const RoundTable = ({ orgs }) => {
	let totals = {
		percent: 0,
		funds: 0,
		total: 0,
		needed: 0
	}

	orgs.map(org => {
		totals.percent += org.percent
		totals.funds += org.roundFunds
		totals.total += org.allocatedFunds + org.leverageFunds
		totals.needed += org.need
	})

	return(
		<Table>
			<TableHead>
				<TableRow>
					<TableCell>Organization</TableCell>
					<TableCell>Earned Funds</TableCell>
					<TableCell>% of Funds</TableCell>
					<TableCell>Total Earned</TableCell>
					<TableCell>Still Needed</TableCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{ orgs.map(org => (
					<TableRow
						key={ org._id }
						className={ org.need === 0 && org.roundFunds > 0 ? 'fully-funded' : '' }
					>
						<TableCell>{ org.title }</TableCell>
						<TableCell>{ org.roundFunds === 0 ? '-' : numeral(org.roundFunds).format('$0,0.00') }</TableCell>
						<TableCell>{ org.percent === 0 ? '-' : numeral(org.percent).format('0.0000%') }</TableCell>
						<TableCell>{ numeral(org.allocatedFunds + org.leverageFunds).format('$0,0.00') }</TableCell>
						<TableCell>{ org.need === 0 ? <Icon color='green' name='check circle' /> : numeral(org.need).format('$0,0.00') }</TableCell>
					</TableRow>
				)) }
			</TableBody>

			<TableFooter>
				<TableRow>
					<TableCell align="right">Totals:</TableCell>
					<TableCell>{ numeral(totals.funds).format('$0,0.00') }</TableCell>
					<TableCell>{ numeral(totals.percent).format('0.00%') }</TableCell>
					<TableCell>{ numeral(totals.total).format('$0,0.00') }</TableCell>
					<TableCell>{ numeral(totals.needed).format('$0,0.00') }</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	)
}

RoundTable.propTypes = {
	orgs: PropTypes.array
}

export default RoundTable
