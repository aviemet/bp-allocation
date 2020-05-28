import React from 'react'
import PropTypes from 'prop-types'
import { Button, Loader } from 'semantic-ui-react'
import { COLORS } from '/imports/lib/global'
import { useTheme } from '/imports/api/providers'
import numeral from 'numeral'

import styled from 'styled-components'

const VotingComplete = ({ clearAllValues, org, amount }) => {
	const { theme, isLoading: themeLoading } = useTheme()

	const showVotingPageAgain = () => {
		clearAllValues()
	}

	if(themeLoading) return <Loader active />
	const formatted = {
		amount: numeral(amount).format('$0,0[.]00'),
		total: numeral(amount * theme.matchRatio).format('$0,0[.]00')
	}
	console.log({ formatted })
	return (
		<>
			<Centered>
				<h1>Thank You For Your Pledge!</h1>
				<p>Your generous donation to <b><u>{ org.title }</u></b> of <b>{ formatted.amount }</b> was matched by the remaining leverage for a total of <b>{ formatted.total }</b></p>
			</Centered>
			<BottomAligned>
				<AmendVoteButton
					size='huge'
					disabled={ false }
					onClick={ showVotingPageAgain }
				>Pledge Again</AmendVoteButton>
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
	bottom: 2em;
	left: 0;
	width: 100%;
	text-align: center;
`

const AmendVoteButton = styled(Button)`
	text-align: center;
	background-color: ${COLORS.blue} !important;
	color: white !important;
	border: 2px solid #fff !important;
	font-size: 2rem !important;
	text-transform: uppercase !important;
	margin-bottom: 10px;
`

VotingComplete.propTypes = {
	clearAllValues: PropTypes.func,
	org: PropTypes.object,
	amount: PropTypes.number
}

export default VotingComplete
