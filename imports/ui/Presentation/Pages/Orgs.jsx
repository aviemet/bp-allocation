import React, { useContext } from 'react';
import _ from 'lodash';

import { Card, Container, Image } from 'semantic-ui-react';
import styled from 'styled-components';

import { ThemeContext, OrganizationContext, PresentationSettingsContext, ImageContext } from '/imports/context';

import OrgCard from '/imports/ui/Components/OrgCard';

import { COLORS } from '/imports/utils';

const OrgsContainer = styled.div`
	padding-top: 20px;

	.ui.card {
		.orgsImage{
			height: 181px;
		}

		.content{
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

const DimOverlay = styled.div`
	width: calc(100% + 10px);
	height: calc(100% + 10px);
	background-color: rgba(0,0,0,0.8);
	position: absolute;
	top: -5px;
	left: -5px;
	z-index: 1;

	img {
		opacity: 0.125;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

`;

const Overlay = () => (
	<DimOverlay>
		{/*<Image src='/img/BPLogo.svg' />*/}
	</DimOverlay>
);

const Orgs = props => {

	const { orgs, topOrgs } = useContext(OrganizationContext);
	const { settings } = useContext(PresentationSettingsContext);
	const { images } = useContext(ImageContext);

	let colorOrgs = {};
	topOrgs.map((org, i) => {
		colorOrgs[org._id] = true;
	});

	return (
		<OrgsContainer>
			<PageTitle>Participating Organizations</PageTitle>
			<Container>
				<Card.Group centered itemsPerRow={4}>
				{orgs.map((org, i) => (
					<OrgCard
						key={org._id}
						org={org}
						image={_.find(images, ['_id', org.image])}
						index={i}
						overlay={settings.colorizeOrgs && colorOrgs[org._id] ? Overlay : false}
					/>
				))}
				</Card.Group>
			</Container>
		</OrgsContainer>
	);
}

export default Orgs;
