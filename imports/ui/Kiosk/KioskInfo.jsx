import React, { useContext } from 'react';

import { Loader, Card, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import { ThemeContext, OrganizationContext, PresentationSettingsContext } from '/imports/context';

import OrgCard from '/imports/ui/Components/OrgCard';

const OrgsContainer = styled.div`
	padding-top: 20px;

	.ui.card .content{
		color: #002B45;
		padding-bottom: 0.2em;
	}

	p{
		line-height: 1em;
	}
`;

const KioskInfo = props => {
	const theme = useContext(ThemeContext);
	const settings = useContext(PresentationSettingsContext);
	const orgs = useContext(OrganizationContext);

	if(props.loading) {
		return <Loader />
	}

	return (
		<OrgsContainer>
			<Container>
				<Card.Group centered itemsPerRow={4}>
					{/*this.props.orgs.map(org => (
						<OrgCard org={org} key={org._id} />
					))*/}
				</Card.Group>
			</Container>
		</OrgsContainer>
	);
}

export default KioskInfo
