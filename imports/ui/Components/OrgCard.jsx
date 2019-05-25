import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import { Card, Image } from 'semantic-ui-react';
import styled from 'styled-components';

import { Organizations, Images } from '/imports/api';
import { OrganizationsSchema } from '/imports/api/schema';

import AwardEmblem from './AwardEmblem';

const OrgTitle = styled.p`
	font-family: TradeGothic;
	font-size: 1.5em;
	margin: 5px;
	font-weight: 600;
`;

const OrgAsk = styled.p`
	font-family: TradeGothic20;
	font-size: 2.1em;
	font-weight: 700;
`;

const CardImage = styled.div`
	width: 100%;
	height: 205px;
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
`;

const CardContent = styled(Card.Content)`
	background-color: ${props => props.bgcolor} !important;
	color: ${props => (props.bgcolor ? '#FFF' : '#222')};
`;

/**
 * OrgCard Component
 */
const OrgCard = props => {

	// Add animation class if toggled
	let animateClass = props.animateClass ? 'animate-orgs' : '';

	let imagePath = '';
	if(props.image && props.image.path){
		imagePath = Images.link(props.image, 'original', '/');
	}

	let className = props.bgcolor ? 'white' : '';

	// let total = props.org.allocatedFunds + props.org.leverageFunds;

	const Overlay = props.overlay || false;

	return (
		<Card className={animateClass}>
			<CardImage style={{ backgroundImage: `url(${imagePath})` }} className='orgsImage'>
				{Overlay && <Overlay />}
			</CardImage>
			<CardContent bgcolor={props.bgcolor || '#FFF'} className={className}>
				<OrgTitle>{props.org.title}</OrgTitle>
				<OrgAsk>{numeral(props.org.ask).format('$0a')}</OrgAsk>
			</CardContent>
		</Card>
	);
}

export default OrgCard;
