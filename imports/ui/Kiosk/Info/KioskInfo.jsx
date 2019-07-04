import React from 'react';
import _ from 'lodash';

import { Loader, Card, Container, Header } from 'semantic-ui-react';
import styled from 'styled-components';

import { useTheme, useOrganizations, useImages } from '/imports/context';

import OrgCard from '/imports/ui/Components/OrgCard';

const OrgsContainer = styled(Container)`
	padding-top: 20px;

	.ui.card {

		.orgsImage {
			height: 150px;
		}

		.content{
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
	const { themeLoading } = useTheme();
	const { orgs, orgsLoading } = useOrganizations();
	const { images } = useImages();

	if(themeLoading || orgsLoading) {
		return <Loader />;
	}

	return (
		<OrgsContainer>
			<Header as='h1' id="title">ORGANIZATIONS THIS THEME</Header>
			<Card.Group centered itemsPerRow={ 3 }>
				{orgs.map((org, i) => (
					<OrgCard
						key={ org._id }
						org={ org }
						image={ _.find(images, ['_id', org.image]) }
					/>
				))}
			</Card.Group>
		</OrgsContainer>
	);
};

export default KioskInfo;
