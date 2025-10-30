import React, { useState } from "react"
import PropTypes from "prop-types"
import {
	Box,
	Checkbox,
	Collapse,
	IconButton,
	TableCell,
	TableRow,
} from "@mui/material"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"

const EnhancedTableRow = ({
	row,
	headCells,
	isSelected,
	selectOnClick,
	handleClick,
	render,
	collapse,
	striped = false,
	selectable = true,
}) => {
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
		</React.Fragment>
	)
}

EnhancedTableRow.propTypes = {
	row: PropTypes.object.isRequired,
	headCells: PropTypes.array,
	isSelected: PropTypes.func,
	selectOnClick: PropTypes.bool,
	handleClick: PropTypes.func,
	render: PropTypes.any,
	collapse: PropTypes.any,
	striped: PropTypes.bool,
	selectable: PropTypes.bool,
}

export default EnhancedTableRow
