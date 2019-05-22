import React from 'react';

import { Loader, Card, Container, Header } from 'semantic-ui-react';
import styled from 'styled-components';

import { useTheme, useOrganizations, usePresentationSettings } from '/imports/context';

import OrgCard from '/imports/ui/Components/OrgCard';

const OrgsContainer = styled.div`
	padding-top: 20px;

	.ui.card {

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

const KioskInfo = props => {
	const { theme, themeLoading } = useTheme();
	const { topOrgs, orgsLoading } = useOrganizations();
	const { settings } = usePresentationSettings();

	if(themeLoading || orgsLoading) {
		return <Loader />
	}

	return (
		<OrgsContainer>
			<Container>
				<Header as='h1' id="title">ALLOCATE YOUR FUNDS</Header>
						<Card.Group centered itemsPerRow={2}>
							{topOrgs.map(org => (
								<OrgCard org={org} key={org._id} />
							))}
						</Card.Group>
			</Container>
		</OrgsContainer>
	);
}

export default KioskInfo
