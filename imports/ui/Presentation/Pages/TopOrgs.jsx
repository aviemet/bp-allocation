import React, { useContext } from 'react';
import _ from 'lodash';

import { Card } from 'semantic-ui-react';
import styled from 'styled-components';

import { OrganizationContext, PresentationSettingsContext, ImageContext } from '/imports/context';

import OrgCard from '/imports/ui/Components/OrgCard';

const TopOrgsContainer = styled.div`
	padding-top: 60px;

	.ui.card{

		.content{
			color: #002B45;
			padding-bottom: 0.2em;
		}

		.orgsImageDisabled{
			height: 245px;
		}
	}

	p{
		line-height: 1em;
	}
`;

const PageTitle = styled.h2`
	margin-bottom: 46px;
`;

const CardsContainer = styled.div`
	width: 100%;
	max-width: 1600px;
	margin: 0 auto;

	.ui.card div.content p{
		color: #FFF;
	}
`;

const TopOrgs = () => {

	const { topOrgs } = useContext(OrganizationContext);
	const { settings } = useContext(PresentationSettingsContext);
	const { images } = useContext(ImageContext);

	return (
		<TopOrgsContainer>
			<PageTitle>Top {topOrgs.length} Organizations</PageTitle>
			<CardsContainer>
				<Card.Group centered itemsPerRow={ Math.ceil(topOrgs.length / 2) }>
					{topOrgs.map((org) => (
						<OrgCard
							key={ org._id }
							org={ org }
							image={ _.find(images, ['_id', org.image]) }
							animateClass={ settings.animateOrgs }
							size='big'
						/>
					))}
				</Card.Group>
			</CardsContainer>
		</TopOrgsContainer>
	);
};

export default TopOrgs;
