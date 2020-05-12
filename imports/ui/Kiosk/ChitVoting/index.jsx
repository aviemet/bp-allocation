import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { observer } from 'mobx-react-lite';
import { useData, useSettings, useOrgs } from '/imports/api/providers';
import { FundsVoteContext } from '/imports/ui/Kiosk/VotingContext';

import { Card, Container, Header, Button } from 'semantic-ui-react';
import styled from 'styled-components';

import VotingComplete from '../VotingComplete';
import OrgCard from '/imports/ui/Components/OrgCard';
import ChitTicker from './ChitTicker';
import useInterval from '/imports/ui/Components/useInterval';

import { COLORS } from '/imports/lib/global';
import { toJS } from 'mobx';

const VotesRemaining = React.memo(({ value }) => {
	return (
		<Header as='h1' className="title">
			ROUND 1 VOTES LEFT: <NumberFormat>{ value }</NumberFormat>
		</Header>
	);
});

VotesRemaining.displayName = 'VotesRemaining'; // To slience eslint

const FundsVotingKiosk = observer(props => {
	const data = useData();
	const { settings } = useSettings();
	const { topOrgs } = useOrgs();

	const [ votingComplete, setVotingComplete ] = useState(false);
	const [ countdownVisible, setCountdownVisible ] = useState(false);
	const [ count, setCount ] = useState(60);
	const [ isCounting, setIsCounting ] = useState(false);
	
	useInterval(() => {
		setCount(count - 1);
	}, isCounting ? 1000 : null);

	const displayCountDown = () => {
		setCountdownVisible(true);
		setCount(data.votingRedirectTimeout);
		setIsCounting(true);
	};

	useEffect(() => {
		// Display countdown if user is on voting screen when voting becomes disabled
		if(!settings.chitVotingActive) displayCountDown();
	}, [settings.chitVotingActive]);

	const memberName = props.user.firstName ? props.user.firstName : props.user.fullName;

	if(votingComplete) {
		return <VotingComplete />;
	}
	return (
		<OrgsContainer>

			<Header as='h1' className="title">{props.user.firstName && 'Voting for'} {memberName}</Header>

			{ countdownVisible && <Header as='h3' className='countdown'>
				Voting has ended, please submit your votes. <br/>
				This page will redirect in { count } seconds
			</Header> }

			<Card.Group doubling centered itemsPerRow={ 2 }>
				{topOrgs.map(org => {
					return(
						<OrgCard
							key={ org._id }
							org={ org }
							showAsk={ false }
							size='small'
							info={ true }
							content={ () => (
								<ChitTicker
									org={ org }
								/>
							) }
						/>);
				})}
			</Card.Group>

			<FundsVoteContext.Consumer>{({ chits, saveChits, member }) => {
				let sum = 0;
				_.forEach(chits, value => sum += value);
				const remaining = member.theme.chits - sum;
				const buttonDisabled = remaining !== 0;
				
				return(
					<React.Fragment>
						<VotesRemaining value={ remaining } />
						<FinalizeButton
							size='huge'
							disabled={ buttonDisabled }
							onClick={ () => {
								saveChits(props.source);
								setVotingComplete(true);
							} }>Finalize Vote</FinalizeButton>
					</React.Fragment>
				);
			}}</FundsVoteContext.Consumer>
		</OrgsContainer>
	);
});

const OrgsContainer = styled(Container)`
	padding-top: 20px;

	&& .ui.centered.two.cards {
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

	&& .ui.card {
		margin: 0.3rem;

		.content{
			padding: 0.2em 0.5em 1.5em;
		}
	}

	&& h1.ui.header.title {
		color: #FFF;
		text-align: center;
		font-size: 3rem;
		text-transform: uppercase;
	}

	&& h3.ui.header {
		font-size: 1.5rem;
		color: #FFF;
		text-align: center;
	}

	&& p {
		line-height: 1em;
	}
`;

const FinalizeButton = styled(Button)`
	width: 100%;
	text-align: center;
	background-color: ${COLORS.blue} !important;
	color: white !important;
	border: 2px solid #fff !important;
	font-size: 2rem !important;
	text-transform: uppercase !important;
`;

const NumberFormat = styled.span`
	width: 12rem;
	display: inline-block;
`;

FundsVotingKiosk.propTypes = {
	user: PropTypes.object,
	source: PropTypes.string
};

VotesRemaining.propTypes = {
	value: PropTypes.number
};

export default FundsVotingKiosk;
