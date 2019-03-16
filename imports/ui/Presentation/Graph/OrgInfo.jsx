import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import { getSaveAmount } from '/imports/utils';

import { Organizations } from '/imports/api';

import numeral from 'numeral';

import { Loader, Grid } from 'semantic-ui-react';
import styled from 'styled-components';

const InfoContainer = styled(Grid.Column)`
	&&{
		margin: 0 1.5em;
		padding: 0 !important;
		margin-bottom: -6px;
		bottom: 0;
		text-align: center;
		font-size: 1.5em;
		line-height: 1em;
	}
`;

const Title = styled.div`
	min-height: 60px;
`;

const Ask = styled.div`
	color: #ea810c;
`;

const MatchNeed = styled.div`
	color: #00853f;
`;

const TotalNeed = styled.div`
	color: #c31a1a;
`;

const OrgInfo = (props)  => {
	if(props.loading){
		return ( <Loader /> );
	}

	const need = props.org.ask - props.org.amount_from_votes - props.org.leverage_funds - props.org.pledges - props.org.topoff - getSaveAmount(props.theme.saves, props.org._id) || 0;

	return (
		<InfoContainer className='orginfo'>
			<Title>{props.org.title}</Title>
			<Ask>Ask: ${numeral(props.org.ask).format('0.0a')}</Ask>
			<MatchNeed>Match Need: {need > 0 ? `$${numeral(need / 2).format('0.0a')}` : '--'}</MatchNeed>
			<TotalNeed>Total Need: {need > 0 ? `$${numeral(need).format('0.0a')}` : '--'}</TotalNeed>
		</InfoContainer>
	);
}

export default OrgInfo;
