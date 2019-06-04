import { Meteor } from 'meteor/meteor';
import React, { useContext, useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import numeral from 'numeral';

import { roundFloat } from '/imports/utils';

import { useTheme, useOrganizations, usePresentationSettings, useImages } from '/imports/context';
import { FundsVoteContext, useVoting } from '/imports/ui/Kiosk/VotingContext';

import { Loader, Card, Container, Header, Button } from 'semantic-ui-react';
import styled from 'styled-components';

import InputRange from 'react-input-range';

import VotingComplete from '../VotingComplete';
import OrgCard from '/imports/ui/Components/OrgCard';
import FundsSlider from './FundsSlider';

import { COLORS } from '/imports/global';

const OrgsContainer = styled(Container)`
	padding-top: 20px;

	.ui.centered.two.cards {
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

	.ui.card {
		margin: 1rem;

		.content{
			padding-bottom: 0.2em;
		}
	}

	h1.ui.header.title {
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

const FinalizeButton = styled(Button)`
	width: 100%;
	text-align: center;
	background-color: ${COLORS.blue} !important;
	color: white !important;
	border: 2px solid #fff !important;
	font-size: 2rem !important;
	text-transform: uppercase !important;
`
const NumberFormat = styled.span`
	width: 12rem;
	display: inline-block;
`;

const AmountRemaining = React.memo(function AmountRemaining({value}) {
	return <Header as='h1' className="title">FUNDS LEFT TO ALLOCATE: <NumberFormat>{numeral(value).format('$0,0')}</NumberFormat></Header>
});

const FundsVotingKiosk = props => {

	const { topOrgs, orgsLoading } = useOrganizations();
	const { images } = useImages();

	const [ votingComplete, setVotingComplete ] = useState(false);

	if(votingComplete) {
		return <VotingComplete />
	}
	return (
		<OrgsContainer>

			<Header as='h1' className="title">Voting for {props.memberName}</Header>

			<Card.Group centered itemsPerRow={2}>
				{topOrgs.map(org => {
					return(
						<OrgCard
							key={org._id}
							org={org}
							image={_.find(images, ['_id', org.image])}
							size='small'
							content={() => (
								<FundsSlider
									org={org}
								/>
							)}
						/>)
				})}
			</Card.Group>

			<FundsVoteContext.Consumer>{({votes, saveVotes, member}) => {
				let sum = 0;
				_.forEach(votes, value => sum += value);
				return(
					<React.Fragment>
						<AmountRemaining value={member.theme.amount - sum} />
						<FinalizeButton size='huge' onClick={() => {
							saveVotes();
							setVotingComplete(true);
						}}>Finalize Vote</FinalizeButton>
					</React.Fragment>
				)
			}}</FundsVoteContext.Consumer>
		</OrgsContainer>
	);
}

export default FundsVotingKiosk;
