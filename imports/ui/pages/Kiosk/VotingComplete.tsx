import styled from "@emotion/styled"
import { Button } from "@mui/material"
import {
	Box,
} from "@mui/material"
import { useEffect } from "react"

import { useVoting } from "./VotingContext"

import { COLORS } from "/imports/lib/global"
import { useData } from "/imports/api/providers"

interface VotingCompleteProps {
	setVotingComplete: (value: boolean) => void
}

const VotingComplete = ({ setVotingComplete }: VotingCompleteProps) => {
	const data = useData()
	const { settings } = useSettings()

	const { unsetUser } = useVoting()

	useEffect(() => {
		data.setVotingRedirectTimeout(0)

		setTimeout(() => {
			unsetUser()
		}, 3000)

		return () => data.resetVotingRedirectTimeout()
	}, [data, unsetUser])

	const showVotingPageAgain = () => {
		// data.votingRedirectTimeout = data.defaultVotingRedirectTimeout
		setVotingComplete(false)
	}

	const getRoundNumberFeedback = () => {
		const roundStr = " in Round"
		if(settings && settings.chitVotingActive) {
			return `${roundStr} 1`
		} else if(settings && settings.fundsVotingActive) {
			return `${roundStr} 2`
		}
		return false
	}

	return (
		<VotingCompleteContainer id="votingCompleteContainer">
			<Box sx={ { mt: 6 } }>
				<h1>Thank You For Voting{ getRoundNumberFeedback() }!</h1>
			</Box>
			<Box><p>Results will be available shortly</p></Box>
			<Box>
			<AmendVoteButton
				disabled={ false }
				onClick={ showVotingPageAgain }
			>
				Amend Vote
			</AmendVoteButton>
			</Box>
		</VotingCompleteContainer>
	)
}

const VotingCompleteContainer = styled.div`
	display: flex;
	min-height: 100%;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;

	& > * {
		flex: 1;
	}

	& h1 {
		text-align: center;
		text-transform: uppercase;
		font-size: 6rem;
		line-height: 6rem;
		color: white;
		
		@media screen and (min-width: 351px) and (max-width: 768px) {
			font-size: 4rem !important;
			line-height: 4.5rem;
		}

		@media screen and (max-width: 350px) {
			font-size: 16vw !important;
			line-height: 17vw;
		}
	}

	& p {
		text-align: center;
		margin-top: 20px;
		font-size: 1.5rem;
		color: white;
	}
`

const AmendVoteButton = styled(Button)`
	text-align: center;
	background-color: ${COLORS.blue};
	color: white;
	border: 2px solid #fff;
	font-size: 2rem;
	text-transform: uppercase;
	margin-bottom: 10px;
`

export default VotingComplete
