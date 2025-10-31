import styled from "@emotion/styled"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { IconButton } from "@mui/material"
import { forEach } from "lodash"
import PropTypes from "prop-types"
import { useState, useLayoutEffect } from "react"

import { useVoting } from "../VotingContext"

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
			<TransparentButton variant="text" onClick={ () => handleChange(value - 1) }>
				<RemoveIcon />
			</TransparentButton>

			<Amount>{ value }</Amount>

			<TransparentButton variant="text" onClick={ () => handleChange(value + 1) }>
				<AddIcon />
			</TransparentButton>
		</TickerContainer>
	)
}

const TickerContainer = styled.div`
	width: 100%;
	height: 100%;
	margin: 0;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
`

const Amount = styled.div`
	font-size: 4rem;
	text-align: center;
	line-height: 1.15;
	display: inline-block;
	padding: 0 15px;
`

const TransparentButton = styled(IconButton)`
	color: white;
	font-size: 3rem;
`

ChitTicker.propTypes = {
	org: PropTypes.object,
}

export default ChitTicker
