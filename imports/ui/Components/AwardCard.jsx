import React from 'react'
import PropTypes from 'prop-types'

import { Card } from 'semantic-ui-react'
import styled from 'styled-components'
import numeral from 'numeral'

import AwardEmblem from './AwardEmblem'

import { COLORS } from '/imports/lib/global'

/**
 * OrgCard Component
 */
const AwardCard = props => {

	const amount = props.amount ? 
		numeral(props.amount).format('$0.[0]a') : 
		props.org.allocatedFunds + props.org.leverageFunds

	return (
		<OrgCard>
			<CardImage>
				<AwardEmblem
					type={ props.award }
					amount={ amount }
				/>
			</CardImage>
			<CardContent>
				<OrgTitle>{ props.org.title }</OrgTitle>
			</CardContent>
		</OrgCard>
	)
}

const OrgCard = styled(Card)`
	body .ui.cards > &, && {
		background-color: ${COLORS.green};
	}
`

const OrgTitle = styled.p`
	font-family: TradeGothic;
	font-size: 1.5em;
	margin: 5px;
	font-weight: 600;
`
/*
const OrgAsk = styled.p`
	font-family: TradeGothic20;
	font-size: 2.1em;
	font-weight: 700;
`
*/
const CardImage = styled.div`
	width: 100%;
	height: 205px;
	/*padding: 5px;*/
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
`

const CardContent = styled(Card.Content)`
	background-color: ${props => props.bgcolor} !important;
	color: #FFF;
	text-align: center;
	/* color: #002B45; */
`

AwardCard.propTypes = {
	org: PropTypes.object,
	award: PropTypes.string,
	amount: PropTypes.number
}

export default AwardCard
