import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import { Card, Image } from 'semantic-ui-react';
import styled from 'styled-components';

import { Organizations, Images } from '/imports/api';
import { OrganizationsSchema } from '/imports/api/schema';

import AwardEmblem from './AwardEmblem';

import { COLORS } from '/imports/global';

const OrgCard = styled(Card)`
	body .ui.cards > &, && {
		background-color: ${COLORS.green};
	}
`;

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
	/*padding: 5px;*/
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
`;

const CardContent = styled(Card.Content)`
	background-color: ${props => props.bgcolor} !important;
	color: #FFF;
	// color: #002B45;
`;

/**
 * OrgCard Component
 */
const AwardCard = props => {

	const Overlay = props.overlay || false;

	return (
		<OrgCard>
			<CardImage>
				<AwardEmblem
					type={props.award}
					amount={props.org.allocatedFunds + props.org.leverageFunds}
				/>
			</CardImage>
			<CardContent>
				<OrgTitle>{props.org.title}</OrgTitle>
			</CardContent>
		</OrgCard>
	);
}

export default AwardCard;
