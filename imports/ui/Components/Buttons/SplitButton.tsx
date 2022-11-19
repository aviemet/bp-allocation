import React, { useState, useRef } from 'react'
import {
	Button,
	ButtonGroup,
	ClickAwayListener,
	Grow,
	Paper,
	Popper,
	MenuItem,
	MenuList,
	ButtonProps,
} from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

interface ISplitButtonProps extends ButtonProps {
	options: Record<string, string>[]
	defaultSelected?: number
}

const SplitButton = ({ options, defaultSelected = 0 }: ISplitButtonProps) => {
	const [selectedIndex, setSelectedIndex] = useState(defaultSelected)
	const [open, setOpen] = useState(false)

	const anchorRef = useRef(null)

	const handleClick = () => {
		options[selectedIndex].action()
	}

	const handleMenuItemClick = (event, index) => {
		setSelectedIndex(index)
		setOpen(false)
		options[index].action()
	}

	const handleToggle = () => {
		setOpen((prevOpen) => !prevOpen)
	}

	const handleClose = (event: MouseEvent | TouchEvent) => {
		if(anchorRef.current && anchorRef.current.contains(event.target)) return

		setOpen(false)
	}

	return (
		<>
			<ButtonGroup variant="contained" ref={ anchorRef } aria-label="split button">
				<Button onClick={ handleClick }>{ options[selectedIndex].title }</Button>
				<Button
					size="small"
					aria-controls={ open ? 'split-button-menu' : undefined }
					aria-expanded={ open ? 'true' : undefined }
					aria-label="select merge strategy"
					aria-haspopup="menu"
					onClick={ handleToggle }
				>
					<ArrowDropDownIcon />
				</Button>
			</ButtonGroup>
			<Popper
				open={ open }
				anchorEl={ anchorRef.current }
				role={ undefined }
				transition
				disablePortal
				style={ { zIndex: 2000 } }
			>
				{ ({ TransitionProps, placement }) => (
					<Grow
						{ ...TransitionProps }
						style={ {
							transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
						} }
					>
						<Paper>
							<ClickAwayListener onClickAway={ handleClose }>
								<MenuList id="split-button-menu">
									{ options.map((option, index) => (
										<MenuItem
											key={ option.title }
											selected={ index === selectedIndex }
											onClick={ (event) => handleMenuItemClick(event, index) }
										>
											{ option.title }
										</MenuItem>
									)) }
								</MenuList>
							</ClickAwayListener>
						</Paper>
					</Grow>
				) }
			</Popper>
		</>
	)
}

export default SplitButton
