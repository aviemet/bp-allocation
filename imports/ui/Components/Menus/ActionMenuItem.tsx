import React from 'react'
import { MenuItem } from '@mui/material'

interface ActionMenuItemProps {
	children: React.ReactNode
	onClick: (e: React.MouseEventHandler<HTMLLIElement> | undefined) => void
	handleClose: (e: React.MouseEventHandler<HTMLLIElement> | undefined) => void
}

const ActionMenuItem = ({ children, onClick, handleClose }: ActionMenuItemProps) => {
	const handleClick = (e: React.MouseEventHandler<HTMLLIElement> | undefined) => {
		if(onClick !== undefined) onClick(e)
		handleClose(e)
	}

	return <MenuItem onClick={ handleClick } disableRipple>{ children }</MenuItem>
}

export default ActionMenuItem
