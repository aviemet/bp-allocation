import React from 'react'
import { alpha } from '@mui/material/styles'
import {
	IconButton,
	TextField,
	Toolbar,
	Tooltip,
	Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'

interface IEnhancedTableToolbarProps {
	title?: React.ReactNode
	filterParams?: string
	onFilterParamsChange?: (value: string) => void
	numSelected: number
	onDelete?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const EnhancedTableToolbar = ({
	title,
	filterParams,
	onFilterParamsChange,
	numSelected,
	onDelete,
}: IEnhancedTableToolbarProps) => {
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
			{ numSelected > 0 ? (
				<Typography
					sx={ { flex: '1 1 100%' } }
					color="inherit"
					variant="subtitle1"
					component="div"
				>
					{ numSelected } selected
				</Typography>
			) : (
				<Typography
					sx={ { flex: '1 1 100%' } }
					variant="h6"
					id="tableTitle"
					component="div"
				>
					{ onFilterParamsChange !== undefined ? (
						<TextField
							fullWidth
							size="small"
							label="Search"
							value={ filterParams || '' }
							onChange={ e => onFilterParamsChange(e.target.value) }
							InputProps={ {
								startAdornment: <SearchIcon sx={ { mr: 1 } } />,
							} }
							sx={ {
								mb: 1,
							} }
						/>
					) : title ? title : '' }
				</Typography>
			) }

			{ numSelected > 0 ? (
				<Tooltip title="Delete">
					<IconButton onClick={ onDelete }>
						<DeleteIcon />
					</IconButton>
				</Tooltip>
			) : ( <></>
			// <Tooltip title="Filter list">
			// 	<IconButton>
			// 		<FilterListIcon sx={ { ml: 1 } } />
			// 	</IconButton>
			// </Tooltip>
			) }
		</Toolbar>
	)
}

export default EnhancedTableToolbar
