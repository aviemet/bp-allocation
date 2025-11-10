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

interface RoundTableProps {
	orgs: Array<{
		_id: string
		title?: string
		roundFunds?: number
		percent?: number
		allocatedFunds?: number
		leverageFunds?: number
		need?: number
	}>
}

const RoundTable = ({ orgs }: RoundTableProps) => {
	let totals = {
		percent: 0,
		funds: 0,
		total: 0,
		needed: 0,
	}

	orgs.map(org => {
		totals.percent += org.percent || 0
		totals.funds += org.roundFunds || 0
		totals.total += (org.allocatedFunds || 0) + (org.leverageFunds || 0)
		totals.needed += org.need || 0
	})

	return (
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
				className={ (org.need || 0) === 0 && (org.roundFunds || 0) > 0 ? "fully-funded" : "" }
			>
				<TableCell>{ org.title }</TableCell>
				<TableCell>{ (org.roundFunds || 0) === 0 ? "-" : numeral(org.roundFunds || 0).format("$0,0.00") }</TableCell>
				<TableCell>{ (org.percent || 0) === 0 ? "-" : numeral(org.percent || 0).format("0.0000%") }</TableCell>
				<TableCell>{ numeral((org.allocatedFunds || 0) + (org.leverageFunds || 0)).format("$0,0.00") }</TableCell>
				<TableCell>{ (org.need || 0) === 0 ? <CheckIcon color="success" /> : numeral(org.need || 0).format("$0,0.00") }</TableCell>
			</TableRow>
		)) }
			</TableBody>

			<TableFooter>
				<TableRow>
					<TableCell align="right">Totals:</TableCell>
					<TableCell>{ numeral(totals.funds).format("$0,0.00") }</TableCell>
					<TableCell>{ numeral(totals.percent).format("0.00%") }</TableCell>
					<TableCell>{ numeral(totals.total).format("$0,0.00") }</TableCell>
					<TableCell>{ numeral(totals.needed).format("$0,0.00") }</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	)
}

export default RoundTable
