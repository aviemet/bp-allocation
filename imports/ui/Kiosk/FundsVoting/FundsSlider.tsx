import React, { useState, useLayoutEffect } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import numeral from "numeral"

import { useVoting } from "/imports/ui/Kiosk/VotingContext"

import styled from "@emotion/styled"
import Slider from "react-slider"

import { TextField, InputAdornment, IconButton, Box, Typography } from "@mui/material"
import KeyboardIcon from "@mui/icons-material/Keyboard"
import CheckIcon from "@mui/icons-material/Check"

/**
 * Tactile slider for adjusting voting amount
 */
const FundsSlider = props => {
	const { member, allocations, updateAllocations } = useVoting()

	const context = Object.assign({ member, allocations, updateAllocations }, props)

	return <FundsSliderComponent { ...context }>{ props.children }</FundsSliderComponent>
}

/**
 * Full Component containing Slider, Org Title and amount feedback
 */
const FundsSliderComponent = props => {
	const [ value, setValue ] = useState(parseInt(props.allocations[props.org._id]))
	const [ showLabel, setShowLabel ] = useState(false) // Toggles showing slider percent label
	const [ showInput, setShowInput ] = useState(false) // Toggles between text $ amount and input

	const MAX = props.member.theme.amount

	useLayoutEffect(() => {
		// Disable contextmenu for long press on mobile
		// document.oncontextmenu = () => false
	}, [])

	const handleChange = value => {
		if(value < 0 || value > MAX) return

		// undefined value from empty DB field should be dealt with correctly
		if(_.isNaN(value)) {
			setValue(0)
			props.updateAllocations(props.org._id, 0)
			return
		}

		// Constrain value to not exceed total funds of member
		let sum = 0
		_.forEach(props.allocations, (voteAmount, key) => {
			sum += key === props.org._id ? parseInt(value) : voteAmount
		})
		const constrained = MAX - sum < 0 ? parseInt(value) + (MAX - sum) : parseInt(value)
		setValue(constrained)

		// Save new value to DB on every change
		props.updateAllocations(props.org._id, constrained)
	}

	// Show % label for slider on click, hide on mouseup/touchend
	const toggleSliderLabel = () => {
		setShowLabel(true)
		// Hopefully fix issue where onChangeComplete doesn't fire
		window.addEventListener("mouseup", () => setShowLabel(false), { once: true })
		window.addEventListener("touchend", () => setShowLabel(false), { once: true })
	}

	// Replace $ amount with input, switch back with click outside of input
	const toggleAmountInput = e => {
		e.stopPropagation()

		setShowInput(true)

		window.addEventListener("click", handlePageClick, false)
		window.addEventListener("touchstart", handlePageClick, false)
	}

	// Listens for click outside of $ input to hide input
	const handlePageClick = e => {
		const inputContainer = document.getElementById("inputContainer")

		if(inputContainer && !inputContainer.contains(e.target)) {
			hideInput()
		}
	}

	// Hide $ amount input
	const hideInput = () => {
		handleChange(_.isNaN(value) ? 0 : value) // Save value to DB
		setShowInput(false)
		window.removeEventListener("click", handlePageClick, false)
		window.removeEventListener("touchstart", handlePageClick, false)
	}

	return (
		<FundsInputContainer>
			{ showInput ?
				<div id="inputContainer">

					<TextField
						value={ value || "" }
						onChange={ e => handleChange(parseInt(e.currentTarget.value)) }
						InputProps={ {
							inputProps: {
								sx: {
									padding: "0.5rem",
									textAlign: "center",
								},
								inputMode: "numeric",
								pattern: "[0-9.]*",
							},
							startAdornment: (
								<InputAdornment position="start" sx={ { margin: 0 } }>
									<Typography sx={ { fontFamily: "Roboto", margin: "0 !important" } }>$</Typography>
								</InputAdornment>
							),
							endAdornment:(
								<InputAdornment position="end">
									<IconButton onClick={ hideInput } edge="end">
										<CheckIcon />
									</IconButton>
								</InputAdornment>
							),
						} }
						sx={ {
							width: "85%",
							color: "white",
						} }
					/>

				</div>
				:
				<Box
					onClick={ toggleAmountInput }
					sx={ {
						fontSize: "3rem",
						textAlign: "center",
						lineHeight: "2.5rem",
					} }
				>
					{ numeral(value).format("$0,0") }
					<KeyboardIcon sx={ {
						position: "absolute",
						top: "8%",
						left: 0,
						zIndex: 100,
					} } />
				</Box>
			}
			<div className={ showLabel ? "visible" : "" }>
				<div>
					<Slider
						disabled={ !props.member.theme.amount || props.member.theme.amount <= 0 }
						min={ 0 }
						max={ props.member.theme.amount || 1 }
						value={ value || 0 }
						onChange={ handleChange }
						onBeforeChange={ toggleSliderLabel }
						onAfterChange={ () => setShowLabel(false) }
						step={ 5 }
					/>
					{ showLabel && (
						<div style={ { textAlign: "center", marginTop: "0.5rem" } }>
							{ numeral((value || 0) / MAX).format("0%") }
						</div>
					) }
				</div>
			</div>
		</FundsInputContainer>
	)
}

const FundsInputContainer = styled.div`
	width: 100%;
	height: 100%;
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	margin: 1rem 0 0.25rem 0;
`

FundsSliderComponent.propTypes = {
	member: PropTypes.object,
	org: PropTypes.object,
	updateAllocations: PropTypes.func,
	allocations: PropTypes.object,

}

FundsSlider.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]),
}

export default FundsSlider
