import React, { useState } from 'react'
import {
	Box,
	Checkbox,
	Collapse,
	IconButton,
	TableCell,
	TableRow,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { type TTableHeadCells } from './EnhancedTableHead'

interface IEnhancedTableRowProps {
	row: Record<string, any>
	headCells?: TTableHeadCells[]
	isSelected: (row: string) => boolean
	selectOnClick?: boolean
	handleClick?: (row: string) => void
	render: (record: unknown) => React.ReactNode
	collapse?: (record: unknown) => React.ReactNode
	striped?: boolean
	selectable?: boolean
}

const EnhancedTableRow = ({
	row,
	headCells = [],
	isSelected,
	selectOnClick,
	handleClick,
	render,
	collapse,
	striped = false,
	selectable = true,
}: IEnhancedTableRowProps) => {
	const [collapseOpen, setCollapseOpen] = useState(false)

	const isItemSelected = isSelected(row._id)

	const colCount = () => {
		let count = headCells.length
		if(selectable) count++
		if(collapse !== undefined) count++
		return count
	}

	return (
		<React.Fragment key={ row._id }>
			<TableRow
				hover
				onClick={ () => {
					if(handleClick && selectOnClick) handleClick(row._id)
				} }
				role="checkbox"
				aria-checked={ isItemSelected }
				tabIndex={ -1 }
				selected={ isItemSelected }
				sx={ { '& > *': { borderBottom: 'unset' } } }
				className={ striped ? 'striped' : '' }
			>
				{ selectable && <TableCell padding="checkbox">
					<Checkbox
						color="primary"
						checked={ isItemSelected }
						onClick={ () => { if(handleClick) handleClick(row._id)} }
					/>
				</TableCell> }
				{ collapse && (
					<TableCell sx={ { width: '1px', paddingLeft: 0, paddingRight: 0 } }>
						<IconButton
							aria-label="expand row"
							size="small"
							onClick={ () => setCollapseOpen(!collapseOpen) }
						>
							{ collapseOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon /> }
						</IconButton>
					</TableCell>
				) }
				{ render(row) }
			</TableRow>
			{ collapse && (
				<TableRow>
					<TableCell style={ { paddingBottom: 0, padding: '0 0 0 48px' } } colSpan={ colCount() }>
						<Collapse in={ collapseOpen } timeout="auto" unmountOnExit>
							<Box sx={ { margin: 0 } }>
								{ collapse(row) }
							</Box>
						</Collapse>
					</TableCell>
				</TableRow>
			) }
		</React.Fragment>
	)
}

export default EnhancedTableRow
