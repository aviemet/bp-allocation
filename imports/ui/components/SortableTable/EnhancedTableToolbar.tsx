import DeleteIcon from "@mui/icons-material/Delete"
import SearchIcon from "@mui/icons-material/Search"
import {
	IconButton,
	TextField,
	Toolbar,
	Tooltip,
	Typography,
} from "@mui/material"
import { alpha } from "@mui/material/styles"
import { type ReactNode } from "react"

interface EnhancedTableToolbarProps {
	title?: ReactNode
	filterParams?: string | null
	onFilterParamsChange?: (value: string) => void
	numSelected: number
	onDelete?: () => void
}

export default function EnhancedTableToolbar({
	title,
	filterParams,
	onFilterParamsChange,
	numSelected,
	onDelete,
}: EnhancedTableToolbarProps) {
	return (
		<Toolbar
			sx={ {
				pl: { sm: 2 },
				pr: { xs: 1, sm: 1 },
				pt: { xs: 1, sm: 2 },
				...(numSelected > 0 && {
					bgcolor: (theme) =>
						alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
				}),
			} }
		>
			{ numSelected > 0
				? (
					<Typography
						sx={ { flex: "1 1 100%" } }
						color="inherit"
						variant="subtitle1"
						component="div"
					>
						{ numSelected } selected
					</Typography>
				)
				: (
					<Typography
						sx={ { flex: "1 1 100%" } }
						variant="h6"
						id="tableTitle"
						component="div"
					>
						{ onFilterParamsChange !== undefined
							? (
								<TextField
									fullWidth
									size="small"
									label="Search"
									value={ filterParams || "" }
									onChange={ e => onFilterParamsChange(e.target.value) }
									slotProps={ {
										input: {
											startAdornment: <SearchIcon sx={ { mr: 1 } } />,
										},
									} }
									sx={ {
										mb: 1,
									} }
								/>
							)
							: title || "" }
					</Typography>
				) }

			{ numSelected > 0
				? (
					<Tooltip title="Delete">
						<IconButton onClick={ onDelete }>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				)
				: null }
		</Toolbar>
	)
}
