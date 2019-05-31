import { Meteor } from 'meteor/meteor';
import React, { useContext, useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import numeral from 'numeral';

import { roundFloat } from '/imports/utils';

import { useTheme, useOrganizations, usePresentationSettings, useImages } from '/imports/context';
import { useVoting } from '/imports/ui/Kiosk/VotingContext';

import { Loader, Card, Container, Header, Button } from 'semantic-ui-react';
import styled from 'styled-components';

import InputRange from 'react-input-range';

import OrgCard from '/imports/ui/Components/OrgCard';
import FundsSlider from './FundsSlider';

const OrgsContainer = styled(Container)`
	padding-top: 20px;

	.ui.card {
		margin: 2rem 1rem;

		.content{
			color: #002B45;
			padding-bottom: 0.2em;
		}
	}

	.title {
		color: #FFF;
		text-align: center;
		font-size: 3rem;
		text-transform: uppercase;
	}

	p {
		line-height: 1em;
	}
`;

const SliderContainer = styled.div`
	width: 100%;
	height: 100%;
	background: rgba(0,0,0,0.5);
	margin: 0;
	padding: 15px;
	position: relative;

	.input-range {
		margin-bottom: 15px;
	}
`;

const Amount = styled.div`
	font-size: 5.75rem;
	text-align: center;
	line-height: 1.15;
	margin-top: 2rem;
`;

const BottomAlign = styled.div`
	position: absolute;
	bottom: 0;
	width: 100%;
	padding-right: 30px;
`;

const AmountRemaining = React.memo(function AmountRemaining({value}) {
	return <Header as='h1' className="title">FUNDS LEFT TO ALLOCATE: {numeral(value).format('$0,0')}</Header>
});

const FundsVotingKiosk = props => {

	const { theme, themeLoading } = useTheme();
	const { topOrgs, orgsLoading } = useOrganizations();
	const { images } = useImages();
	const { settings } = usePresentationSettings();

	const { member } = useVoting();

	let sum = 0;
	let votes = {};
	if(!_.isUndefined(props.member) && !orgsLoading) {
		topOrgs.map(org => {
			const vote = _.find(props.member.theme.allocations, ['organization', org._id]);
			votes[org._id] = vote ? vote.amount : 0;
			sum += votes[org._id];
		});
	}

	const finalizeVotes = () => {}

	const changeVotesValue = (org, amount) => {
		console.log({org, amount});
		votes[org] = amount;
		console.log({votes});
		sum -= amount;
	}

	const MAX_AMOUNT = member.theme.amount;

	return (
		<OrgsContainer>

			<Header as='h1' className="title">Voting for {member.firstName}</Header>

			<Card.Group centered itemsPerRow={2}>
				{topOrgs.map(org => {
					return(
						<OrgCard
							key={org._id}
							org={org}
							image={_.find(images, ['_id', org.image])}
							overlay={() => (

						  	<FundsSlider
						  		org={org}
						  		onUpdate={changeVotesValue}
					  		/>

							)}
						/>)
				})}
			</Card.Group>
			<AmountRemaining value={member.theme.amount - sum} />
			<Button size='huge' onClick={finalizeVotes}>Finalize Vote</Button>
		</OrgsContainer>
	);
}

export default FundsVotingKiosk;
