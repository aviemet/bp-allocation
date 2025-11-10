import CheckIcon from "@mui/icons-material/Check"
import {
	Table,
	TableHead,
	TableBody,
	TableFooter,
	TableRow,
	TableCell,
} from "@mui/material"
import numeral from "numeral"

interface ResultsTableProps {
	round: {
		orgs: Array<{
			_id: string
			title?: string
			leverageFunds?: number
			allocatedFunds?: number
			ask?: number
			need?: number
		}>
	}
}

const ResultsTable = ({ round }: ResultsTableProps) => {
	let totals = {
		spread: 0,
		total: 0,
		needed: 0,
	}

	round.orgs.map(org => {
		totals.spread += org.leverageFunds || 0
		totals.total += (org.allocatedFunds || 0) + (org.leverageFunds || 0)
		totals.needed += org.need || 0
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
			<TableRow key={ org._id } className={ (org.need || 0) === 0 ? "fully-funded" : "" }>
				<TableCell>{ org.title }</TableCell>
				<TableCell>{ (org.leverageFunds || 0) === 0 ? "-" : numeral(org.leverageFunds || 0).format("$0,0.00") }</TableCell>
				<TableCell>{ numeral(org.ask).format("$0,0.00") }</TableCell>
				<TableCell>{ numeral((org.allocatedFunds || 0) + (org.leverageFunds || 0)).format("$0,0.00") }</TableCell>
				<TableCell>{ (org.need || 0) === 0 ? <CheckIcon color="success" /> : numeral(org.need || 0).format("$0,0.00") }</TableCell>
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

export default ResultsTable
