import React from 'react'
import numeral from 'numeral'
import  { Box, Stack, TableCell } from '@mui/material'

interface IMoneyCellProps {
	children: React.ReactNode
	format: string
}

const MoneyCell = ({ children, format = '0,0.00' }: IMoneyCellProps) => {
	return (
		<TableCell align="right">
			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<Box sx={ { mr: 1 } }>$</Box>
				<Box>{ numeral(children).format(format) }</Box>
			</Stack>
		</TableCell>
	)
}

export default MoneyCell
