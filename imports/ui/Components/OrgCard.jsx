import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import { Card, Image } from 'semantic-ui-react';
import styled from 'styled-components';

import { Organizations, Images } from '/imports/api';
import { OrganizationsSchema } from '/imports/api/schema';

import AwardEmblem from './AwardEmblem';

const GREEN = "#0D8744";
const BLUE = "#002B43";

const StyledCard = styled(Card)`
	text-align: center;

	&& {
		border: 5px solid #FFF !important;
	}

	&.big {
		/*height: 24rem;*/
	}
`;

const OrgTitle = styled.div`
	font-family: TradeGothic;
	font-size: 2.5rem;
	margin: 5px;
	font-weight: 600;
	min-height: 8rem;
	position: relative;

	.big & {
		min-height: 4rem;
	}

	& > p {
		display: block;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
`;

const OrgAsk = styled.p`
	font-family: TradeGothic20;
	font-size: 3rem;
	font-weight: 700;
`;

const CardContent = styled(Card.Content)`
	background-color: ${props => props.bgcolor} !important;
	color: '#FFF';
`;

/**
 * OrgCard Component
 */
const OrgCard = props => {

	console.log({props});

	// Add animation class if toggled
	// let animateClass = props.animateClass ? 'animate-orgs' : '';

	let imagePath = '';
	if(props.image && props.image.path){
		imagePath = Images.link(props.image, 'original', '/');
	}

	const Overlay = props.overlay || false;
	const Content = props.content || false;

	let bgcolor = GREEN;
	if(props.index) {
		const row = parseInt(props.index / 4) % 4;
		bgcolor = (props.index + (row % 2)) % 2 === 0 ? GREEN : BLUE;
	}

	cardClass = `${props.size ? props.size : ''} ${props.animateClass ? 'animate-orgs' : ''}`;

	return (
		<StyledCard className={cardClass}>
			{Overlay && <Overlay />}

			<CardContent bgcolor={bgcolor} >

				{props.content && <Card.Content>
					<Content />
				</Card.Content>}

				<OrgTitle><p>{props.org.title}</p></OrgTitle>
				<OrgAsk>{numeral(props.org.ask).format('$0a')}</OrgAsk>
			</CardContent>
		</StyledCard>
	);
}

export default OrgCard;
