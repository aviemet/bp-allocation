import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import numeral from 'numeral'

import { useVoting } from '/imports/ui/Kiosk/VotingContext'

import styled from 'styled-components'
import InputRange from 'react-input-range'
import { Input, Button, Icon } from 'semantic-ui-react'

/**
 * Tactile slider for adjusting voting amount
 */
const FundsSlider = props => {
	const { member, allocations, updateAllocations } = useVoting()

	const context = Object.assign({ member, allocations, updateAllocations }, props)

	return <FundsSliderComponent { ...context }>{props.children}</FundsSliderComponent>
}

/**
 * Full Component containing Slider, Org Title and amount feedback
 */
const FundsSliderComponent = props => {
	const [ value, setValue ] = useState(parseInt(props.allocations[props.org._id]))
	const [ showLabel, setShowLabel ] = useState(false) // Toggles showing slider percent label
	const [ showInput, setShowInput ] = useState(false) // Toggles between text $ amount and input

	const MAX = props.member.theme.amount

	useEffect(() => {
		// Disable contextmenu for long press on mobile
		document.oncontextmenu = () => false
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
		window.addEventListener('mouseup', () => setShowLabel(false), { once: true })
		window.addEventListener('touchend', () => setShowLabel(false), { once: true })
	}

	// Replace $ amount with input, switch back with click outside of input
	const toggleAmountInput = e => {
		e.stopPropagation()

		setShowInput(true)

		window.addEventListener('click', handlePageClick, false)
		window.addEventListener('touchstart', handlePageClick, false)
	}

	// Listens for click outside of $ input to hide input
	const handlePageClick = e => {
		const inputContainer = document.getElementById('inputContainer')

		if(inputContainer && !inputContainer.contains(e.target)) {
			hideInput()
		}
	}

	// Hide $ amount input
	const hideInput = () => {
		handleChange(_.isNaN(value) ? 0 : value) // Save value to DB
		setShowInput(false)
		window.removeEventListener('click', handlePageClick, false)
		window.removeEventListener('touchstart', handlePageClick, false)
	}

	return (
		<SliderContainer>
			{showInput ?
				<AmountInputContainer id='inputContainer'>
					<Input fluid
						type='number'
						pattern="[0-9]*"
						value={ value || '' }
						onChange={ e => handleChange(parseInt(e.currentTarget.value)) }
						size='massive'
						icon='dollar'
						iconPosition='left'
						action={ <Button onClick={ hideInput }><Icon name='check' /></Button> }
					/>
				</AmountInputContainer>
				:
				<Amount onClick={ toggleAmountInput }>
					{ numeral(value).format('$0,0') }
					<Icon name='keyboard' size='tiny' />
				</Amount>
			}
			<BottomAlign className={ showLabel ? 'visible' : '' }>
				<InputRange
					disabled={ !props.member.theme.amount || props.member.theme.amount <= 0 }
					minValue={ 0 }
					maxValue={ props.member.theme.amount || 1 }
					value={ value || 0 }
					onChange={ handleChange }
					onChangeStart={ toggleSliderLabel }
					onChangeComplete={ () => setShowLabel(false) }
					formatLabel={ value => numeral(value / MAX).format('0%') }
					step={ 5 }
				/>
			</BottomAlign>
		</SliderContainer>
	)
}

const SliderContainer = styled.div`
	width: 100%;
	height: 100%;
	margin: 0;
	position: relative;

	.input-range {
		margin-bottom: 15px;
	}
`

const Amount = styled.div`
	font-size: 4rem;
	text-align: center;
	line-height: 1.15;

	.icon {
		position: absolute;
		top: 25%;
		left: 0;

		&.tiny {
			font-size: 0.3em;
		}
	}
`

const AmountInputContainer = styled.div`
	&& .ui.massive.input {
		height: 64px;
		text-align: center;
		font-size: 2.5rem;

		input {
			padding-left: 1.25em !important;
			padding-right: 0.5em !important;
		}

		.icon {
			width: 1.25em;
		}
	}
`

const BottomAlign = styled.div`
	margin: 15px 5px -15px 5px;
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
		PropTypes.node
	])
}

export default FundsSlider
