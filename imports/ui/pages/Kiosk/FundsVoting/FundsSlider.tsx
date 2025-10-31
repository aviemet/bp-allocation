import styled from "@emotion/styled"
import CheckIcon from "@mui/icons-material/Check"
import KeyboardIcon from "@mui/icons-material/Keyboard"
import { TextField, InputAdornment, IconButton, Box, Typography, Slider } from "@mui/material"
import _ from "lodash"
import numeral from "numeral"
import { useState, useLayoutEffect, type ReactNode, type MouseEvent } from "react"

import { useVoting } from "../VotingContext"
import { type MemberData, type OrgData } from "/imports/api/db"
import { type MemberTheme } from "/imports/types/schema"

interface MemberWithTheme extends MemberData {
	theme: MemberTheme
}

interface FundsSliderComponentProps {
	member: MemberWithTheme
	org: OrgData
	allocations: Record<string, number>
	updateAllocations: (orgId: string, amount: number) => void
}

interface FundsSliderProps {
	org: OrgData
	children?: ReactNode
}

const FundsSlider = ({ org, children }: FundsSliderProps) => {
	const { member, allocations, updateAllocations } = useVoting()

	if(!member) {
		return null
	}

	return (
		<FundsSliderComponent
			member={ member as MemberWithTheme }
			org={ org }
			allocations={ allocations }
			updateAllocations={ updateAllocations }
		>
			{ children }
		</FundsSliderComponent>
	)
}

const FundsSliderComponent = ({ member, org, allocations, updateAllocations }: FundsSliderComponentProps) => {
	const [ value, setValue ] = useState(parseInt(allocations[org._id] || "0"))
	const [ showLabel, setShowLabel ] = useState(false)
	const [ showInput, setShowInput ] = useState(false)
	const [ isDragging, setIsDragging ] = useState(false)

	const MAX = member.theme.amount || 0

	useLayoutEffect(() => {
		// Disable contextmenu for long press on mobile
		// document.oncontextmenu = () => false
	}, [])

	const handleChange = (newValue: number) => {
		if(newValue < 0 || newValue > MAX) return

		if(_.isNaN(newValue)) {
			setValue(0)
			updateAllocations(org._id, 0)
			return
		}

		let sum = 0
		_.forEach(allocations, (voteAmount, key) => {
			sum += key === org._id ? parseInt(String(newValue)) : voteAmount
		})
		const constrained = MAX - sum < 0 ? parseInt(String(newValue)) + (MAX - sum) : parseInt(String(newValue))
		setValue(constrained)

		updateAllocations(org._id, constrained)
	}

	const toggleAmountInput = (e: MouseEvent) => {
		e.stopPropagation()

		setShowInput(true)

		window.addEventListener("click", handlePageClick, false)
		window.addEventListener("touchstart", handlePageClick, false)
	}

	const handlePageClick = (e: Event) => {
		const inputContainer = document.getElementById("inputContainer")
		const target = e.target as Node

		if(inputContainer && !inputContainer.contains(target)) {
			hideInput()
		}
	}

	const hideInput = () => {
		handleChange(_.isNaN(value) ? 0 : value)
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
						onChange={ e => {
							const parsed = parseInt(e.currentTarget.value)
							if(!_.isNaN(parsed)) {
								handleChange(parsed)
							}
						} }
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
						disabled={ !member.theme.amount || member.theme.amount <= 0 }
						min={ 0 }
						max={ member.theme.amount || 1 }
						value={ value || 0 }
						onChange={ (_, newValue) => {
							if(!isDragging) {
								setIsDragging(true)
								setShowLabel(true)
							}
							handleChange(typeof newValue === "number" ? newValue : newValue[0])
						} }
						onChangeCommitted={ () => {
							setIsDragging(false)
							setShowLabel(false)
						} }
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

export default FundsSlider
