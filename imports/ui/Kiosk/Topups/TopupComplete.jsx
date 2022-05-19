import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@mui/material'
import { COLORS } from '/imports/lib/global'
import { useTheme } from '/imports/api/providers'
import numeral from 'numeral'
import styled from '@emotion/styled'
import { Loading } from '/imports/ui/Components'

const VotingComplete = ({ data, resetData }) => {
	const { theme, isLoading: themeLoading } = useTheme()

	if(themeLoading) return <Loading />
	const formatted = {
		amount: numeral(data.amount).format('$0,0[.]00'),
		total: numeral(data.amount * theme.matchRatio).format('$0,0[.]00')
	}

	return (
		<>
			<Centered>
				<h1>Thank You For Your Pledge!</h1>
				<p>Your generous donation to <b><u>{ data.org.title }</u></b> of <b>{ formatted.amount }</b> was matched by the remaining leverage bringing them <b>{ formatted.total }</b> closer to being fully funded</p>
			</Centered>
			<BottomAligned>
				<AmendVoteButton
					size='huge'
					disabled={ false }
					onClick={ resetData }
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
		
		@media screen and (min-width: 351px) and (max-width: ${({ theme }) => theme.screen.tablet}px) {
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
	data: PropTypes.object,
	resetData: PropTypes.func,
}

export default VotingComplete
