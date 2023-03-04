import React, { useState } from 'react'
import { Set } from 'immutable'
import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TablePagination,
	TableRow,
} from '@mui/material'
import { getComparator, stableSort } from './sort'
import EnhancedTableHead, { TTableHeadCells } from './EnhancedTableHead'
import EnhancedTableToolbar from './EnhancedTableToolbar'
import EnhancedTableRow from './EnhancedTableRow'


interface ISortableTableProps {
	title?: React.ReactNode
	headCells: TTableHeadCells[]
	tableHeadTopRow: unknown[]
	rows: unknown[]
	render: (record: unknown) => React.ReactNode
	collapse: (record: unknown) => React.ReactNode
	striped: boolean
	defaultOrderBy: string
	defaultDirection: 'asc'|'desc'
	paginate: boolean
	paginationCounts: number[]
	onBulkDelete: (set: unknown[], cb: Function) => void
	dense: boolean
	selectOnClick: boolean
	filterParams: string
	onFilterParamsChange: (value: string) => void
	selectable: boolean
	fixed: boolean
}

const SortableTable = ({
	title,
	headCells,
	tableHeadTopRow,
	rows,
	render,
	collapse,
	striped = false,
	defaultOrderBy,
	defaultDirection = 'desc',
	paginate = true,
	paginationCounts = [10, 25, 50],
	onBulkDelete,
	dense = false,
	selectOnClick = false,
	filterParams,
	onFilterParamsChange,
	selectable = false,
	fixed = false,
	...props
}: ISortableTableProps) => {
	const [order, setOrder] = useState(defaultDirection)
	const [orderBy, setOrderBy] = useState(defaultOrderBy || headCells[0].id)
	const [selected, setSelected] = useState(Set())
	const [page, setPage] = useState(0)
	const [rowsPerPage, setRowsPerPage] = useState(paginationCounts[0])

	const handleRequestSort = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>, property: string) => {
		const isAsc = orderBy === property && order === 'asc'
		setOrder(isAsc ? 'desc' : 'asc')
		setOrderBy(property)
	}

	const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
		if(event.target.checked) {
			setSelected(Set(rows.map((n) => n._id)))
		} else {
			setSelected(Set())
		}
	}

	const handleClick = (id: string) => {
		if(selected.has(id)) {
			setSelected(selected.delete(id))
		} else {
			setSelected(selected.add(id))
		}
	}

	// TODO: Could may eliminate the callback by using a Promise
	const handleDelete = () => {
		if(!onBulkDelete) return

		onBulkDelete(selected.toArray(), () => {
			setSelected(Set())
		})
	}

	const handleChangePage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, newPage: number) => {
		setPage(newPage)
	}

	const handleChangeRowsPerPage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		setRowsPerPage(parseInt(event.target.value, 10))
		setPage(0)
	}

	const doPagination = (rows: number[]) => {
		if(!paginate) return rows

		return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
	}

	const isSelected = (id: string) => selected.has(id)

	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0

	const variants = []
	if(striped) variants.push(`striped${ collapse ? '-collapse' : ''}`)

	return (
		<Box sx={ { width: '100%' } }>
			<Paper sx={ { width: '100%', mb: 2 } }>
				<EnhancedTableToolbar
					title={ title }
					numSelected={ selected.size }
					onDelete={ handleDelete }
					filterParams={ filterParams }
					onFilterParamsChange={ onFilterParamsChange }
				/>
				<TableContainer>
					<Table
						stickyHeader
						style={ {
							width: '100%',
							tableLayout: fixed ? 'fixed' : 'initial',
						} }
						aria-labelledby="tableTitle"
						size={ dense ? 'small' : 'medium' }
						variants={ variants.join(' ') }
						{ ...props }
					>
						<EnhancedTableHead
							headCells={ headCells }
							spanForCollapse={ collapse !== undefined }
							tableHeadTopRow={ tableHeadTopRow }
							numSelected={ selected.size }
							order={ order }
							orderBy={ orderBy }
							onSelectAllClick={ handleSelectAllClick }
							onRequestSort={ handleRequestSort }
							rowCount={ rows.length }
							selectable={ selectable }
						/>
						<TableBody>
							{ doPagination(stableSort(rows, getComparator(order, orderBy)))
								.map((row, i) => (
									<EnhancedTableRow
										key={ row._id }
										headCells={ headCells }
										isSelected={ isSelected }
										selectOnClick={ selectOnClick }
										handleClick={ handleClick }
										render={ render }
										collapse={ collapse }
										row={ row }
										selectable={ selectable }
									/>
								))
							}
							{ emptyRows > 0 && (
								<TableRow
									style={ {
										height: (dense ? 33 : 53) * emptyRows,
									} }
								>
									<TableCell colSpan={ headCells.length } />
								</TableRow>
							) }
						</TableBody>
					</Table>
				</TableContainer>
				{ paginate && <TablePagination
					rowsPerPageOptions={ paginationCounts }
					component="div"
					count={ rows.length }
					rowsPerPage={ rowsPerPage }
					page={ page }
					onPageChange={ handleChangePage }
					onRowsPerPageChange={ handleChangeRowsPerPage }
				/> }
			</Paper>
		</Box>
	)
}

export default SortableTable
