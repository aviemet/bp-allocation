import React from 'react';

import { Card, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import OrgCard from '/imports/ui/Components/OrgCard';

const OrgsContainer = styled.div`
	padding-top: 20px;

	.ui.card {
		.orgsImage{
			height: 181px;
		}

		.content{
			color: #002B45;
			padding-bottom: 0.2em;
		}
	}

	p{
		line-height: 1em;
	}
`;

const PageTitle = styled.h2`
	margin-bottom: 20px;
`;

const Orgs = (props) => {
	return (
		<OrgsContainer>
			<PageTitle>Participating Organizations</PageTitle>
			<Container>
				<Card.Group centered itemsPerRow={4}>
				{props.orgs.map((org) => (
					<OrgCard org={org} key={org._id} />
				))}
				</Card.Group>
			</Container>
		</OrgsContainer>
	);
}

export default Orgs;
