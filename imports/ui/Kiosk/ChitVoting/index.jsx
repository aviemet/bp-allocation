import React from 'react';

import { Card, Container, Header } from 'semantic-ui-react';
import styled from 'styled-components';

import { observer } from 'mobx-react-lite';
import { useOrgs } from '/imports/api/providers';

import OrgCard from '/imports/ui/Components/OrgCard';

const KioskChitVoting = observer(() => {
	const { orgs } = useOrgs();

	return (
		<OrgsContainer>
			<Container>
				<Header as='h1' id="title">VOTE FOR YOUR FAVORITE ORGANIZATIONS</Header>
				<Card.Group centered itemsPerRow={ 3 }>
					{orgs.map(org => (
						<OrgCard
							key={ org._id }
							org={ org }
						/>
					))}
				</Card.Group>
			</Container>
		</OrgsContainer>
	);
});

const OrgsContainer = styled.div`
	padding-top: 20px;

	.ui.card {

		.orgsImage {
			height: 150px;
		}

		.content{
			color: #002B45;
			padding-bottom: 0.2em;
		}
	}

	#title {
		color: #FFF;
		text-align: center;
		font-size: 3rem;
	}

	p {
		line-height: 1em;
	}
`;

export default KioskChitVoting;
