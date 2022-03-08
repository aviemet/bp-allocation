import React from 'react'
import PropTypes from 'prop-types'
import { styled, alpha } from '@mui/material/styles'

import {
	Menu,
	MenuItem,
} from '@mui/material'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'

const StyledMenu = styled((props) => (
	<Menu
		elevation={ 0 }
		anchorOrigin={ {
			vertical: 'bottom',
			horizontal: 'right',
		} }
		transformOrigin={ {
			vertical: 'top',
			horizontal: 'right',
		} }
		{ ...props }
	/>
))(({ theme }) => ({
	'& .MuiPaper-root': {
		borderRadius: 6,
		marginTop: theme.spacing(1),
		minWidth: 180,
		color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
		boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
		'& .MuiMenu-list': {
			padding: '4px 0',
		},
		'& .MuiMenuItem-root': {
			'& .MuiSvgIcon-root': {
				fontSize: 18,
				color: theme.palette.text.secondary,
				marginRight: theme.spacing(1.5),
			},
			'&:active': {
				backgroundColor: alpha(
					theme.palette.primary.main,
					theme.palette.action.selectedOpacity,
				),
			},
		},
	},
}))


const ActionMenu = ({ render }) => {
	const [anchorEl, setAnchorEl] = React.useState(null)
	const open = Boolean(anchorEl)

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClose = e => {
		setAnchorEl(null)
	}

	const ActionMenuItem = ({ children, onClick }) => {
		const handleClick = e => {
			if(onClick !== undefined) onClick(e)
			handleClose(e)
		}

		return <MenuItem onClick={ handleClick } disableRipple>{ children }</MenuItem>
	}

	ActionMenuItem.propTypes = {
		children: PropTypes.any,
		onClick: PropTypes.func,
	}

	return (
		<div>
			<IconButton
				id="demo-customized-button"
				aria-controls={ open ? 'demo-customized-menu' : undefined }
				aria-haspopup="true"
				aria-expanded={ open ? 'true' : undefined }
				onClick={ handleClick }
			>
				<MoreVertIcon />
			</IconButton>
			<StyledMenu
				id="demo-customized-menu"
				MenuListProps={ {
					'aria-labelledby': 'demo-customized-button',
				} }
				anchorEl={ anchorEl }
				open={ open }
				onClose={ handleClose }
			>
				{ render(ActionMenuItem) }
			</StyledMenu>
		</div>
	)
}

ActionMenu.propTypes = {
	render: PropTypes.func.isRequired,
}

export default ActionMenu
