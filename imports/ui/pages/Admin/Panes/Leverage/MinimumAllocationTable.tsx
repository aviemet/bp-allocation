import {
	Table,
	TableHead,
	TableBody,
	TableFooter,
	TableRow,
	TableCell,
} from "@mui/material"
import numeral from "numeral"

interface MinimumAllocationTableProps {
	orgs: Array<{
		_id: string
		title?: string
		minimumLeverageAllocation?: number
		allocatedFunds?: number
		leverageFunds?: number
		need?: number
		ask?: number
	}>
}

const MinimumAllocationTable = ({ orgs }: MinimumAllocationTableProps) => {
	let totals = {
		minimum: 0,
		total: 0,
		needed: 0,
	}

	orgs.forEach(org => {
		totals.minimum += org.minimumLeverageAllocation || 0
		totals.total += (org.allocatedFunds || 0) + (org.leverageFunds || 0)
		totals.needed += org.need || 0
	})

	return (
		<Table>
			<TableHead>
				<TableRow>
					<TableCell>Organization</TableCell>
					<TableCell>Minimum Allocation</TableCell>
					<TableCell>Ask</TableCell>
					<TableCell>Total After Minimum</TableCell>
					<TableCell>Still Needed</TableCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{ orgs.map(org => (
					<TableRow key={ org._id }>
						<TableCell>{ org.title }</TableCell>
						<TableCell>{ (org.minimumLeverageAllocation || 0) === 0 ? "-" : numeral(org.minimumLeverageAllocation || 0).format("$0,0.00") }</TableCell>
						<TableCell>{ numeral(org.ask).format("$0,0.00") }</TableCell>
						<TableCell>{ numeral((org.allocatedFunds || 0) + (org.leverageFunds || 0)).format("$0,0.00") }</TableCell>
						<TableCell>{ numeral(org.need || 0).format("$0,0.00") }</TableCell>
					</TableRow>
				)) }
			</TableBody>

			<TableFooter>
				<TableRow>
					<TableCell align="right">Totals:</TableCell>
					<TableCell>{ numeral(totals.minimum).format("$0,0.00") }</TableCell>
					<TableCell></TableCell>
					<TableCell>{ numeral(totals.total).format("$0,0.00") }</TableCell>
					<TableCell>{ numeral(totals.needed).format("$0,0.00") }</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	)
}

export default MinimumAllocationTable

