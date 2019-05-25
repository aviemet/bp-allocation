import { Meteor } from 'meteor/meteor';
import React, { useContext, useState } from 'react';
import _ from 'lodash';
import numeral from 'numeral';

import { roundFloat } from '/imports/utils';

import { useTheme, useOrganizations, usePresentationSettings, useImages } from '/imports/context';

import { Loader, Card, Container, Header, Button } from 'semantic-ui-react';
import styled from 'styled-components';

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

const FundsVotingKiosk = props => {

	const { theme, themeLoading } = useTheme();
	const { topOrgs, orgsLoading } = useOrganizations();
	const { images } = useImages();
	const { settings } = usePresentationSettings();

	let initialVotesState = {};
	if(!_.isUndefined(props.member) && !orgsLoading) {
		// Init array of 0 values for votes for the toporgs
		topOrgs.map(org => {
			// Update the vote value if user has voted already
			const vote = _.find(props.member.theme.allocations, ['organization', org._id]);

			initialVotesState[org._id] = vote ? vote.amount : 0;
		});
	}

	const [ votes, setVotes ] = useState(initialVotesState);

	const updateVotes = ({value, orgId}) => {
		let newVotes = votes;
		newVotes[orgId] = value;
		setVotes(newVotes);
	}

	return (
		<OrgsContainer>

			<Header as='h1' className="title">Voting for {props.member.firstName}</Header>

			<Card.Group centered itemsPerRow={2}>
				{topOrgs.map(org => (
					<OrgCard
						key={org._id}
						org={org}
						image={_.find(images, ['_id', org.image])}
						overlay={() => (
							<FundsSlider
								theme={theme}
								member={props.member}
								org={org}
								vote={roundFloat(initialVotesState[org._id])}
								onChangeCallback={updateVotes}
							/>
						)}
					/>
				))}
			</Card.Group>

		</OrgsContainer>
	);
}

export default FundsVotingKiosk;
