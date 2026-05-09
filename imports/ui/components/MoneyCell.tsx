import {
	Box,
	Stack,
	TableCell,
} from "@mui/material"
import numeral from "numeral"

interface MoneyCellProps {
	children: number | string
	format?: string
}

export const MoneyCell = ({ children, format = "0,0.00" }: MoneyCellProps) => {
	return (
		<TableCell align="right">
			<Stack direction="row" sx={ { justifyContent: "space-between", alignItems: "center" } }>
				<Box sx={ { mr: 1 } }>$</Box>
				<Box>{ numeral(children).format(format) }</Box>
			</Stack>
		</TableCell>
	)
}
