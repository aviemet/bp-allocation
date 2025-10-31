import {
	Box,
	Stack,
	TableCell,
} from "@mui/material"
import numeral from "numeral"
import PropTypes from "prop-types"

const MoneyCell = ({ children, format = "0,0.00" }) => {
	return (
		<TableCell align="right">
			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<Box sx={ { mr: 1 } }>$</Box>
				<Box>{ numeral(children).format(format) }</Box>
			</Stack>
		</TableCell>
	)
}

MoneyCell.propTypes = {
	children: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	format: PropTypes.string,
}

export default MoneyCell
