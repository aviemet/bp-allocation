import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import {
	Box,
	Checkbox,
	Collapse,
	IconButton,
	TableCell,
	TableRow,
} from "@mui/material"
import { useState, type ReactNode, type ReactElement, Fragment } from "react"

import { HeadCell, SortableRow } from "./types"

interface EnhancedTableRowProps<T extends SortableRow> {
	row: T
	headCells: HeadCell[]
	isSelected: (id: string) => boolean
	selectOnClick: boolean
	handleClick: (id: string) => void
	render: (row: T) => ReactNode
	collapse?: (row: T) => ReactNode
	striped?: boolean
	selectable?: boolean
}

function EnhancedTableRow<T extends SortableRow>({
	row,
	headCells,
	isSelected,
	selectOnClick,
	handleClick,
	render,
	collapse,
	striped = false,
	selectable = true,
}: EnhancedTableRowProps<T>) {
	const [collapseOpen, setCollapseOpen] = useState(false)

	const isItemSelected = isSelected(row._id)

	const colCount = () => {
		let count = headCells.length
		if(selectable) count++
		if(collapse !== undefined) count++
		return count
	}

	return (
		<Fragment key={ row._id }>
			<TableRow
				hover
				onClick={ () => {
					if(selectOnClick) handleClick(row._id)
				} }
				role="checkbox"
				aria-checked={ isItemSelected }
				tabIndex={ -1 }
				selected={ isItemSelected }
				sx={ { "& > *": { borderBottom: "unset" } } }
				className={ striped ? "striped" : "" }
			>
				{ selectable && <TableCell padding="checkbox">
					<Checkbox
						color="primary"
						checked={ isItemSelected }
						onClick={ () => handleClick(row._id) }
					/>
				</TableCell> }
				{ collapse && (
					<TableCell sx={ { width: "1px", paddingLeft: 0, paddingRight: 0 } }>
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
					<TableCell style={ { paddingBottom: 0, padding: "0 0 0 48px" } } colSpan={ colCount() }>
						<Collapse in={ collapseOpen } timeout="auto" unmountOnExit>
							<Box sx={ { margin: 0 } }>
								{ collapse(row) }
							</Box>
						</Collapse>
					</TableCell>
				</TableRow>
			) }
		</Fragment>
	)
}

export default EnhancedTableRow as <T extends SortableRow>(props: EnhancedTableRowProps<T>) => ReactElement
