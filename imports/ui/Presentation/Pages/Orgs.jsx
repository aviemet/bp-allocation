import React from 'react';

import { Card, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import OrgCard from '/imports/ui/Components/OrgCard';

import { COLORS } from '/imports/utils';

const OrgsContainer = styled.div`
	padding-top: 20px;

	.ui.card {
		.orgsImage{
			height: 181px;
		}

		.content{
			color: #002B45;
			padding-bottom: 0.2em;

			&.white{
				color: #FFF;
			}
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
	let colorOrgs = {};
	props.topOrgs.map((org, i) => {
		colorOrgs[org._id] = COLORS[i % COLORS.length];
	});

	return (
		<OrgsContainer>
			<PageTitle>Participating Organizations</PageTitle>
			<Container>
				<Card.Group centered itemsPerRow={4}>
				{props.orgs.map((org) => (
					<OrgCard org={org} key={org._id} bgcolor={props.theme.colorizeOrgs && colorOrgs[org._id] ? colorOrgs[org._id] : false} />
				))}
				</Card.Group>
			</Container>
		</OrgsContainer>
	);
}

export default Orgs;
