import React from 'react'
import PropTypes from 'prop-types'
import numeral from 'numeral'

import { Card } from 'semantic-ui-react'
import styled from '@emotion/styled'

import { Images } from '/imports/api/db'

/**
 * OrgCard Component
 */
const OrgImageCard = ({ image, org, animateClass, bgcolor, overlay }) => {
	let imagePath = ''
	if(image && image.path){
		imagePath = Images.link(image, 'original', '/')
	}

	let className = bgcolor ? 'white' : ''

	const Overlay = overlay || false

	return (
		<Card className={ animateClass ? 'animate-orgs' : '' }>
			<CardImage style={ { backgroundImage: `url(${imagePath})` } } className='orgsImage'>
				{ Overlay && <Overlay /> }
			</CardImage>
			<CardContent bgcolor={ bgcolor || '#FFF' } className={ className }>
				<OrgTitle>{ org.title }</OrgTitle>
				<OrgAsk>{ numeral(org.ask).format('$0a') }</OrgAsk>
			</CardContent>
		</Card>
	)
}

const OrgTitle = styled.p`
	font-family: TradeGothic;
	font-size: 1.5em;
	margin: 5px;
	font-weight: 600;
`

const OrgAsk = styled.p`
	font-family: TradeGothic20;
	font-size: 2.1em;
	font-weight: 700;
`

const CardImage = styled.div`
	width: 100%;
	height: 205px;
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
`

const CardContent = styled(Card.Content)`
	background-color: ${({ bgcolor }) => bgcolor} !important;
	color: ${({ bgcolor }) => (bgcolor ? '#FFF' : '#222')};
`

OrgImageCard.propTypes = {
	image: PropTypes.object,
	org: PropTypes.object,
	animateClass: PropTypes.bool,
	bgcolor: PropTypes.bool,
	overlay: PropTypes.object
}

export default OrgImageCard
