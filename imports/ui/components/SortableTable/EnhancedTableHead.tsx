import {
	Box,
	Checkbox,
	TableCell,
	TableHead,
	TableRow,
	TableSortLabel,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { visuallyHidden } from "@mui/utils"
import { type ChangeEvent, type MouseEvent } from "react"

import { HeadCell, TableHeadTopRowCell } from "./types"

interface EnhancedTableHeadProps {
	headCells: HeadCell[]
	spanForCollapse?: boolean
	tableHeadTopRow?: TableHeadTopRowCell[]
	onSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void
	order: "asc" | "desc"
	orderBy: string
	numSelected: number
	rowCount: number
	onRequestSort: (event: MouseEvent<unknown>, property: string) => void
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
}: EnhancedTableHeadProps) => {
	const cellsWithDefaults = headCells.map((cell, i) => {
		const cellWithDefaults: HeadCell & { span: number, align: "left" | "right" | "center" } = {
			disablePadding: false,
			sort: true,
			align: "left",
			span: 1,
			...cell,
		}
		if(spanForCollapse && i === 0) {
			cellWithDefaults.span++
		}
		return cellWithDefaults
	})

	const createSortHandler = (property: string) => (event: MouseEvent<unknown>) => {
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
							"aria-label": "select all desserts",
						} }
					/>
				</TableCell> }
				{ cellsWithDefaults.map((headCell) => (
					<TableCell
						key={ headCell.id }
						align={ headCell.align }
						padding={ headCell.disablePadding ? "none" : "normal" }
						sortDirection={ orderBy === headCell.id ? order : false }
						colSpan={ headCell.span > 1 ? headCell.span : undefined }
						width={ headCell.width ? headCell.width : "" }
					>
						{ headCell.sort
							? <TableSortLabel
								active={ orderBy === headCell.id }
								direction={ orderBy === headCell.id ? order : "asc" }
								onClick={ createSortHandler(headCell.id) }
							>
								{ headCell.label }
								{ orderBy === headCell.id
									? (
										<Box component="span" sx={ visuallyHidden }>
											{ order === "desc" ? "sorted descending" : "sorted ascending" }
										</Box>
									)
									: null }
							</TableSortLabel>
							: headCell.label }
					</TableCell>
				)) }
			</TableRow>
		</StyledTableHead>
	)
}

const StyledTableHead = styled(TableHead)(({ theme }) => ({
	backgroundColor: theme.palette.grey[200],
	th: {
		textAlign: "center",
		backgroundColor: "transparent",
		borderRight: `1px solid ${theme.palette.grey[300]}`,
		"&.MuiTableCell-paddingCheckbox": {
			borderRight: "none",
		},
		"&:first-of-type, &:nth-of-type(2)": {
			textAlign: "left",
		},
	},
}))

export default EnhancedTableHead
