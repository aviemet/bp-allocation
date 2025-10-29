import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import {
	Button,
	ButtonGroup,
	ClickAwayListener,
	Grow,
	Paper,
	Popper,
	MenuItem,
	MenuList,
} from "@mui/material"
import React, { useState, useRef, MouseEvent } from "react"

interface SplitButtonOption {
	title: string
	action: () => void
}

interface SplitButtonProps {
	options: SplitButtonOption[]
	defaultSelected?: number
}

const SplitButton = ({ options, defaultSelected = 0 }: SplitButtonProps) => {
	const [selectedIndex, setSelectedIndex] = useState(defaultSelected)
	const [open, setOpen] = useState(false)

	const anchorRef = useRef<HTMLDivElement>(null)

	const handleClick = () => {
		options[selectedIndex].action()
	}

	const handleMenuItemClick = (event: MouseEvent<HTMLLIElement>, index: number) => {
		setSelectedIndex(index)
		setOpen(false)
		options[index].action()
	}

	const handleToggle = () => {
		setOpen((prevOpen) => !prevOpen)
	}

	const handleClose = (event: Event | MouseEvent<Document, MouseEvent>) => {
		if(anchorRef.current && anchorRef.current.contains(event.target as Node)) return

		setOpen(false)
	}

	return (
		<>
			<ButtonGroup variant="contained" ref={ anchorRef } aria-label="split button">
				<Button onClick={ handleClick }>{ options[selectedIndex].title }</Button>
				<Button
					size="small"
					aria-controls={ open ? "split-button-menu" : undefined }
					aria-expanded={ open ? "true" : undefined }
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
                placement === "bottom" ? "center top" : "center bottom",
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
