import React from 'react'
import { visuallyHidden } from '@mui/utils'
import { styled } from '@mui/material/styles'
import {
	Box,
	Checkbox,
	TableCell,
	TableHead,
	TableRow,
	TableSortLabel,
} from '@mui/material'

export type TTableHeadCells = {
	id: string
	label: string
	sort?: boolean
	disablePadding?: boolean
	align?: 'center'|'left'|'right'|'inherit'|'justify'
	span?: number
	width?: string
}

interface IEnhancedTableHeadProps {
	headCells: TTableHeadCells[]
	spanForCollapse?: boolean
	tableHeadTopRow?: TTableHeadCells[]
	numSelected: number
	onRequestSort: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>, property: string) => void
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
	order: 'asc'|'desc'
	orderBy: string
	rowCount: number
	selectable?: boolean
}

const EnhancedTableHead = ({
	headCells,
	spanForCollapse = false,
	tableHeadTopRow,
	onSelectAllClick,
	order,
	orderBy,
	numSelected,
	rowCount,
	onRequestSort,
	selectable = true,
}: IEnhancedTableHeadProps) => {
	const cellsWithDefaults = headCells.map((cell, i) => {
		const cellWithDefaults = {
			disablePadding: false,
			sort: true,
			align: 'left',
			span: 1,
			...cell,
		}
		if(spanForCollapse && i === 0) {
			cellWithDefaults.span++
		}
		return cellWithDefaults
	})

	const createSortHandler = (property: string) => (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
		onRequestSort(event, property)
	}

	return (
		<StyledTableHead>
			{ tableHeadTopRow !== undefined && <TableRow>
				{ tableHeadTopRow.map((cell, i) => (
					<TableCell key={ i } colSpan={ cell.span }>{ cell.label }</TableCell>
				)) }
			</TableRow> }
			<TableRow>
				{ selectable && <TableCell padding="checkbox">
					<Checkbox
						color="primary"
						indeterminate={ numSelected > 0 && numSelected < rowCount }
						checked={ rowCount > 0 && numSelected === rowCount }
						onChange={ onSelectAllClick }
						inputProps={ {
							'aria-label': 'select all desserts',
						} }
					/>
				</TableCell> }
				{ cellsWithDefaults.map((headCell) => (
					<TableCell
						key={ headCell.id }
						align={ headCell.align }
						padding={ headCell.disablePadding ? 'none' : 'normal' }
						sortDirection={ orderBy === headCell.id ? order : false }
						colSpan={ headCell.span > 1 ? headCell.span : undefined }
						width={ headCell.width ? headCell.width : '' }
					>
						{ headCell.sort ? <TableSortLabel
							active={ orderBy === headCell.id }
							direction={ orderBy === headCell.id ? order : 'asc' }
							onClick={ createSortHandler(headCell.id) }
						>
							{ headCell.label }
							{ orderBy === headCell.id ? (
								<Box component="span" sx={ visuallyHidden }>
									{ order === 'desc' ? 'sorted descending' : 'sorted ascending' }
								</Box>
							) : null }
						</TableSortLabel> : headCell.label }
					</TableCell>
				)) }
			</TableRow>
		</StyledTableHead>
	)
}

const StyledTableHead = styled(TableHead)(({ theme }) => ({
	backgroundColor: theme.palette.grey[200],
	th: {
		textAlign: 'center',
		backgroundColor: 'transparent',
		borderRight: `1px solid ${theme.palette.grey[300]}`,
		'&.MuiTableCell-paddingCheckbox': {
			borderRight: 'none',
		},
		'&:first-of-type, &:nth-of-type(2)': {
			textAlign: 'left',
		},
	},
}))

export default EnhancedTableHead
