import React from "react"
import PropTypes from "prop-types"

import numeral from "numeral"

import {
	Table,
	TableHead,
	TableBody,
	TableFooter,
	TableRow,
	TableCell,
} from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"

const ResultsTable = ({ round }) => {
	let totals = {
		spread: 0,
		total: 0,
		needed: 0,
	}

	round.orgs.map(org => {
		totals.spread += org.leverageFunds
		totals.total += org.allocatedFunds + org.leverageFunds
		totals.needed += org.need
	})

	return (
		<Table>
			<TableHead>
				<TableRow>
					<TableCell>Organization</TableCell>
					<TableCell>Leverage Spread</TableCell>
					<TableCell>Ask</TableCell>
					<TableCell>Total Earned</TableCell>
					<TableCell>Still Needed</TableCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{ round.orgs.map(org => (
					<TableRow key={ org._id } className={ org.need === 0 ? "fully-funded" : "" }>
						<TableCell>{ org.title }</TableCell>
						<TableCell>{ org.leverageFunds === 0 ? "-" : numeral(org.leverageFunds).format("$0,0.00") }</TableCell>
						<TableCell>{ numeral(org.ask).format("$0,0.00") }</TableCell>
						<TableCell>{ numeral(org.allocatedFunds + org.leverageFunds).format("$0,0.00") }</TableCell>
						<TableCell>{ org.need === 0 ? <CheckIcon color="success" /> : numeral(org.need).format("$0,0.00") }</TableCell>
					</TableRow>
				)) }
			</TableBody>

			<TableFooter>
				<TableRow>
					<TableCell align="right">Totals:</TableCell>
					<TableCell>{ numeral(totals.spread).format("$0,0.00") }</TableCell>
					<TableCell></TableCell>
					<TableCell>{ numeral(totals.total).format("$0,0.00") }</TableCell>
					<TableCell>{ numeral(totals.needed).format("$0,0.00") }</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	)
}

ResultsTable.propTypes = {
	round: PropTypes.object,
}

export default ResultsTable
