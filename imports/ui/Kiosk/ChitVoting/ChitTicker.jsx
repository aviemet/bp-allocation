import React, { useState, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { isNaN, forEach } from 'lodash'

import { useVoting } from '/imports/ui/Kiosk/VotingContext'

import styled from 'styled-components'
import { Button } from 'semantic-ui-react'

/**
 * Full Component containing Ticker, Org Title and amount feedback
 */
const ChitTicker = ({ org }) => {
	const { member, chits, updateChits } = useVoting()
	const [ value, setValue ] = useState(parseInt(chits[org._id]) || 0)
	
	const MAX = member.theme.chits

	useLayoutEffect(() => {
		// Disable contextmenu for long press on mobile
		document.oncontextmenu = () => false
	}, [])

	// Update voting context with total votes, constraining total across tickers
	const handleChange1 = value => {
		if(value < 0 || value > MAX) return
		console.log({ value })

		// undefined value from empty DB field should be dealt with correctly
		if(isNaN(value)) {
			setValue(0)
			updateChits(org._id, 0)
			return
		}

		console.log({ chits })
		// Constrain value to be between 0 and member's assigned chits
		let sum = 0
		forEach(chits, (votes, orgId) => {
			sum += orgId === org._id ? parseInt(value) : votes
		})
		// const constrained = MAX - sum <= 0 ? parseInt(value) + (MAX - sum) : parseInt(value)
		const constrained = Math.min(Math.max(value, 0), MAX)
		setValue(constrained)
		console.log({ check: MAX - sum < 0, val: MAX - sum })
		console.log({ MAX, sum, constrained })

		// Save new value to DB on every change
		updateChits(org._id, constrained)
	}

	const handleChange = value => {
		if(value < 0 || value > MAX) return

		let sumAfterThisVote = 0
		forEach(chits, (votes, orgId) => sumAfterThisVote += orgId === org._id ? parseInt(value) : votes)
		
		if(sumAfterThisVote > MAX || sumAfterThisVote < 0) return
		
		const constrained = Math.min(Math.max(value, 0), MAX)
		setValue(constrained)

		// Save new value to DB on every change
		updateChits(org._id, constrained)
	}

	return (
		<TickerContainer>
			<TransparentButton icon='minus' onClick={ () => handleChange(value - 1) } size='huge' />

			<Amount>{ value }</Amount>

			<TransparentButton icon='plus' onClick={ () =>  handleChange(value + 1) } size='huge' />
		</TickerContainer>
	)
}

const TickerContainer = styled.div`
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
	display: inline-block;
	padding: 0 15px;
`

const TransparentButton = styled(Button)`
	&& {
		background: none;
		color: white;
		vertical-align: bottom;
		margin-bottom: 4px;
	}
`

ChitTicker.propTypes = {
	org: PropTypes.object
}

export default ChitTicker
