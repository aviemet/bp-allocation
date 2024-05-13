import React, { useState } from 'react'
import PropTypes from 'prop-types'
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
import EnhancedTableHead from './EnhancedTableHead'
import EnhancedTableToolbar from './EnhancedTableToolbar'
import EnhancedTableRow from './EnhancedTableRow'

const SortableTable = ({
	title,
	headCells,
	tableHeadTopRow,
	rows,
	render,
	collapse,
	striped,
	defaultOrderBy,
	defaultDirection,
	paginate,
	paginationCounts,
	onBulkDelete,
	dense,
	selectOnClick,
	filterParams,
	onFilterParamsChange,
	selectable,
	fixed,
	...props
}) => {
	const [order, setOrder] = useState(defaultDirection)
	const [orderBy, setOrderBy] = useState(defaultOrderBy || headCells[0].id)
	const [selected, setSelected] = useState(Set())
	const [page, setPage] = useState(0)
	const [rowsPerPage, setRowsPerPage] = useState(paginationCounts[0])

	const handleRequestSort = (event, property) => {
		// console.log({ property })
		const isAsc = orderBy === property && order === 'asc'
		setOrder(isAsc ? 'desc' : 'asc')
		setOrderBy(property)
	}

	const handleSelectAllClick = event => {
		if (event.target.checked) {
			setSelected(Set(rows.map((n) => n._id)))
		} else {
			setSelected(Set())
		}
	}

	const handleClick = id => {
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

	const handleChangePage = (event, newPage) => {
		setPage(newPage)
	}

	const handleChangeRowsPerPage = event => {
		setRowsPerPage(parseInt(event.target.value, 10))
		setPage(0)
	}

	const doPagination = rows => {
		if(!paginate) return rows

		return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
	}

	const isSelected = id => selected.has(id)

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

SortableTable.propTypes = {
	title: PropTypes.any,
	headCells: PropTypes.array.isRequired,
	tableHeadTopRow: PropTypes.array,
	rows: PropTypes.array.isRequired,
	render: PropTypes.func.isRequired,
	collapse: PropTypes.func,
	striped: PropTypes.bool,
	defaultOrderBy: PropTypes.string,
	defaultDirection: PropTypes.oneOf(['asc','desc']),
	paginate: PropTypes.bool,
	paginationCounts: PropTypes.array,
	onBulkDelete: PropTypes.func,
	dense: PropTypes.bool,
	selectOnClick: PropTypes.bool,
	filterParams: PropTypes.string,
	onFilterParamsChange: PropTypes.func,
	selectable: PropTypes.bool,
	fixed: PropTypes.bool,
}

SortableTable.defaultProps = {
	paginate: true,
	paginationCounts: [10, 25, 50],
	dense: false,
	selectOnClick: false,
	defaultDirection: 'desc',
	striped: false,
	selectable: true,
	fixed: false,
}

export default SortableTable
