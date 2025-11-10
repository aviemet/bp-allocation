import CheckIcon from "@mui/icons-material/Check"
import KeyboardIcon from "@mui/icons-material/Keyboard"
import { OutlinedInput, InputAdornment, IconButton, Box, Typography } from "@mui/material"
import numeral from "numeral"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface ManualInputProps {
	value: number
	onChange: (amount: number) => void
}

const ManualInput = ({ value, onChange }: ManualInputProps) => {
	const [ isInputVisible, setIsInputVisible ] = useState(false)
	const [ initialValue, setInitialValue ] = useState<number | null>(null)
	const [ hasChanged, setHasChanged ] = useState(false)
	const pageClickHandlerRef = useRef<((event: Event) => void) | null>(null)

	const removePageListeners = useCallback(() => {
		if(pageClickHandlerRef.current) {
			window.removeEventListener("click", pageClickHandlerRef.current, false)
			window.removeEventListener("touchstart", pageClickHandlerRef.current, false)
			pageClickHandlerRef.current = null
		}
	}, [])

	const hideInput = useCallback((force = false) => {
		if(!force && hasChanged) {
			return
		}
		onChange(Number.isNaN(value) ? 0 : value)
		setIsInputVisible(false)
		setInitialValue(null)
		setHasChanged(false)
		removePageListeners()
	}, [hasChanged, onChange, removePageListeners, value])

	const handlePageClick = useCallback((event: Event) => {
		const target = event.target
		if(!target || !(target instanceof Node)) {
			return
		}
		const container = document.getElementById("inputContainer")
		if(container && !container.contains(target)) {
			hideInput()
		}
	}, [hideInput])

	const handleConfirm = useCallback(() => {
		hideInput(true)
	}, [hideInput])

	const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const parsed = Number.parseInt(event.currentTarget.value, 10)
		if(Number.isNaN(parsed)) {
			return
		}
		if(initialValue !== null && parsed !== initialValue) {
			setHasChanged(true)
		} else if(initialValue !== null && parsed === initialValue) {
			setHasChanged(false)
		}
		onChange(parsed)
	}, [initialValue, onChange])

	const toggleInput = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
		event.stopPropagation()
		if(isInputVisible) {
			return
		}
		setIsInputVisible(true)
		setInitialValue(value)
		setHasChanged(false)
		pageClickHandlerRef.current = handlePageClick
		window.addEventListener("click", handlePageClick, false)
		window.addEventListener("touchstart", handlePageClick, false)
	}, [handlePageClick, isInputVisible, value])

	useEffect(() => {
		return () => {
			removePageListeners()
		}
	}, [removePageListeners])

	const displayValue = useMemo(() => {
		return numeral(value).format("$0,0")
	}, [value])

	if(isInputVisible) {
		return (
			<div id="inputContainer">
				<OutlinedInput
					value={ value || "" }
					onChange={ handleInputChange }
					inputProps={ {
						inputMode: "numeric",
						pattern: "[0-9.]*",
					} }
					startAdornment={ (
						<InputAdornment position="start" sx={ { margin: 0 } }>
							<Typography sx={ { fontFamily: "Roboto", margin: "0 !important" } }>$</Typography>
						</InputAdornment>
					) }
					endAdornment={ (
						<InputAdornment position="end">
							<IconButton onClick={ handleConfirm } edge="end">
								<CheckIcon />
							</IconButton>
						</InputAdornment>
					) }
					sx={ {
						width: "85%",
						color: "#000",
						backgroundColor: "#FFFFFF",
						input: {
							textAlign: "left",
							padding: "0.5rem",
						},
					} }
				/>
			</div>
		)
	}

	return (
		<Box
			onClick={ toggleInput }
			sx={ {
				fontSize: "3rem",
				textAlign: "center",
				lineHeight: "2.5rem",
			} }
		>
			{ displayValue }
			<KeyboardIcon sx={ {
				position: "absolute",
				top: "8%",
				left: 0,
				zIndex: 100,
			} } />
		</Box>
	)
}

export default ManualInput

