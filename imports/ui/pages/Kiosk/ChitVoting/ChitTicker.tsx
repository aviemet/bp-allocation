import styled from "@emotion/styled"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { IconButton } from "@mui/material"
import { forEach } from "lodash"
import { useEffect, useState, startTransition } from "react"

import { useVoting } from "../VotingContext"
import { type OrgData } from "/imports/api/db"

interface ChitTickerProps {
	org: OrgData
}

/**
 * Full Component containing Ticker, Org Title and amount feedback
 */
const ChitTicker = ({ org }: ChitTickerProps) => {
	const { member, chits, updateChits } = useVoting()
	const [ value, setValue ] = useState(chits[org._id] || 0)

	const MAX = member.theme?.chits || 0

	useEffect(() => {
		const nextValue = chits[org._id] || 0
		if(value !== nextValue) {
			startTransition(() => {
				setValue(nextValue)
			})
		}
	}, [chits, org._id, value])


	const handleChange = (value: number) => {
		if(value < 0 || value > MAX) return

		let sumAfterThisVote = 0
		forEach(chits, (votes, orgId) => sumAfterThisVote += orgId === org._id ? value : votes)

		if(sumAfterThisVote > MAX || sumAfterThisVote < 0) return

		const constrained = Math.min(Math.max(value, 0), MAX)
		setValue(constrained)

		// Save new value to DB on every change
		updateChits(org._id, constrained)
	}

	return (
		<TickerContainer>
			<TransparentButton onClick={ () => handleChange(value - 1) }>
				<RemoveIcon />
			</TransparentButton>

			<Amount>{ value }</Amount>

			<TransparentButton onClick={ () => handleChange(value + 1) }>
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

export default ChitTicker
