import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TablePagination,
	TableRow,
	TableProps,
} from "@mui/material"
import { Set } from "immutable"
import React, { useState } from "react"

import EnhancedTableHead from "./EnhancedTableHead"
import EnhancedTableRow from "./EnhancedTableRow"
import EnhancedTableToolbar from "./EnhancedTableToolbar"
import { getComparator, stableSort } from "./sort"
import { HeadCell, TableHeadTopRowCell, SortableRow } from "./types"

export type { HeadCell, TableHeadTopRowCell, SortableRow } from "./types"

interface SortableTableProps<T extends SortableRow> extends Omit<TableProps, "children" | "title"> {
	title?: React.ReactNode
	headCells: HeadCell[]
	tableHeadTopRow?: TableHeadTopRowCell[]
	rows: T[]
	render: (row: T) => React.ReactNode
	collapse?: (row: T) => React.ReactNode
	striped?: boolean
	defaultOrderBy?: string
	defaultDirection?: "asc" | "desc"
	paginate?: boolean
	paginationCounts?: number[]
	onBulkDelete?: (selected: string[], onSuccess: () => void) => void
	dense?: boolean
	selectOnClick?: boolean
	filterParams?: string | null
	onFilterParamsChange?: (value: string) => void
	selectable?: boolean
	fixed?: boolean
}

export default function SortableTable<T extends SortableRow>({
	title,
	headCells,
	tableHeadTopRow,
	rows,
	render,
	collapse,
	striped = false,
	defaultOrderBy,
	defaultDirection = "desc",
	paginate = true,
	paginationCounts = [10, 25, 50],
	onBulkDelete,
	dense = false,
	selectOnClick = false,
	filterParams,
	onFilterParamsChange,
	selectable = true,
	fixed = false,
	...props
}: SortableTableProps<T>) {
	const [order, setOrder] = useState<"asc" | "desc">(defaultDirection)
	const [orderBy, setOrderBy] = useState<string>(defaultOrderBy || headCells[0].id)
	const [selected, setSelected] = useState<Set<string>>(Set())
	const [page, setPage] = useState(0)
	const [rowsPerPage, setRowsPerPage] = useState(paginationCounts[0])

	const handleRequestSort = (_event: React.MouseEvent<unknown>, property: string) => {
		const isAsc = orderBy === property && order === "asc"
		setOrder(isAsc ? "desc" : "asc")
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

	const handleDelete = () => {
		if(!onBulkDelete) return

		onBulkDelete(selected.toArray(), () => {
			setSelected(Set())
		})
	}

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage)
	}

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10))
		setPage(0)
	}

	const doPagination = (rowsToPaginate: T[]): T[] => {
		if(!paginate) return rowsToPaginate

		return rowsToPaginate.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
	}

	const isSelected = (id: string): boolean => selected.has(id)

	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0

	const tableClassName = striped ? `striped${collapse ? "-collapse" : ""}` : undefined

	return (
		<Box sx={ { width: "100%" } }>
			<Paper sx={ { width: "100%", mb: 2 } }>
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
							width: "100%",
							tableLayout: fixed ? "fixed" : "initial",
						} }
						aria-labelledby="tableTitle"
						size={ dense ? "small" : "medium" }
						className={ tableClassName }
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
							{ doPagination(stableSort(rows, getComparator<T>(order, orderBy)))
								.map((row) => (
									<EnhancedTableRow<T>
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
