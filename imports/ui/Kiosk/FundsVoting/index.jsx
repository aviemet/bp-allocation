import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import numeral from 'numeral';

import { useOrganizations } from '/imports/context';
import { FundsVoteContext } from '/imports/ui/Kiosk/VotingContext';

import { Loader, Card, Container, Header, Button } from 'semantic-ui-react';
import styled from 'styled-components';

import VotingComplete from '../VotingComplete';
import OrgCard from '/imports/ui/Components/OrgCard';
import FundsSlider from './FundsSlider';

import { COLORS } from '/imports/global';

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

const AmountRemaining = React.memo(({ value }) => {
	return (
		<Header as='h1' className="title">
			FUNDS LEFT TO ALLOCATE: <NumberFormat>{numeral(value).format('$0,0')}</NumberFormat>
		</Header>
	);
});

AmountRemaining.displayName = 'AmountRemaining'; // To slience eslint

const FundsVotingKiosk = props => {

	const { topOrgs, orgsLoading } = useOrganizations();

	const [ votingComplete, setVotingComplete ] = useState(false);

	const memberName = props.user.firstName ? props.user.firstName : props.user.fullName;

	if(orgsLoading) {
		return <Loader />;
	}
	if(votingComplete) {
		return <VotingComplete />;
	}
	return (
		<OrgsContainer>

			<Header as='h1' className="title">{props.user.firstName && 'Voting for'} {memberName}</Header>

			<Card.Group centered itemsPerRow={ 2 }>
				{topOrgs.map(org => {
					return(
						<OrgCard
							key={ org._id }
							org={ org }
							// image={_.find(images, ['_id', org.image])}
							showAsk={ false }
							size='small'
							content={ () => (
								<FundsSlider
									org={ org }
								/>
							) }
						/>);
				})}
			</Card.Group>

			<FundsVoteContext.Consumer>{({ votes, saveVotes, member }) => {
				let sum = 0;
				_.forEach(votes, value => sum += value);
				const remaining = member.theme.amount - sum;
				const buttonDisabled = remaining !== 0;
				
				return(
					<React.Fragment>
						<AmountRemaining value={ remaining } />
						<FinalizeButton
							size='huge'
							disabled={ buttonDisabled }
							onClick={ () => {
								saveVotes();
								setVotingComplete(true);
							} }>Finalize Vote</FinalizeButton>
					</React.Fragment>
				);
			}}</FundsVoteContext.Consumer>
		</OrgsContainer>
	);
};

FundsVotingKiosk.propTypes = {
	user: PropTypes.object
};

AmountRemaining.propTypes = {
	value: PropTypes.number
};

export default FundsVotingKiosk;
