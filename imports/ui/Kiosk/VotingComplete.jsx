import React, { useEffect } from 'react'
import { useVoting } from './VotingContext'
import { Button } from 'semantic-ui-react'
import { COLORS } from '/imports/lib/global'

import styled from 'styled-components'

const VotingComplete = () => {

	const { unsetUser } = useVoting()

	useEffect(() => {
		if(unsetUser) {
			setTimeout(() => {
				unsetUser()
			}, 3000)
		}
	}, [])

	return (
		<>
			<Centered>
				<h1>Thank You For Voting!</h1>
				<p>Results will be available shortly</p>
			</Centered>
			<BottomAligned>
				<AmmendVoteButton
					size='huge'
					disabled={ false }
					onClick={ () => {} }
				>Ammend Vote</AmmendVoteButton>
			</BottomAligned>
		</>
	)
}

const Centered = styled.div`
	width: 80%;
	position: fixed;
	top: 40%;
	left: 50%;
	transform: translate(-50%, -50%);
	text-align: center;

	& h1 {
		text-transform: uppercase;
		font-size: 6rem;
		line-height: 6rem;
		color: white;
		
		@media screen and (min-width: 351px) and (max-width: ${({ theme }) => theme.media.onlyTablet.minWidth}px) {
			font-size: 4rem !important;
			line-height: 4.5rem;
		}

		@media screen and (max-width: 350px) {
			font-size: 16vw !important;
			line-height: 17vw;
		}
	}

	& p {
		margin-top: 20px;
		font-size: 1.5rem;
		color: white;
	}
`
const BottomAligned = styled.div`
	position: fixed;
	bottom: 10px;
	left: 0;
	width: 100%;
	text-align: center;
`

const AmmendVoteButton = styled(Button)`
	text-align: center;
	background-color: ${COLORS.blue} !important;
	color: white !important;
	border: 2px solid #fff !important;
	font-size: 2rem !important;
	text-transform: uppercase !important;
	margin-bottom: 10px;
`

export default VotingComplete
