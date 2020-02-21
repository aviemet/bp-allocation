import React from 'react';

import { Card, Loader } from 'semantic-ui-react';
import styled from 'styled-components';

import { observer } from 'mobx-react-lite';
import { useOrgs, useSettings } from '/imports/api/providers';

import OrgCard from '/imports/ui/Components/OrgCard';

const TopOrgs = observer(() => {
	const { settings, isLoading: settingsLoading } = useSettings();
	const { topOrgs, isLoading: orgsLoading } = useOrgs();

	if(settingsLoading || orgsLoading) return <Loader active />;
	return (
		<TopOrgsContainer>
			<PageTitle>Top {topOrgs.length} Organizations</PageTitle>
			<CardsContainer>
				<Card.Group centered itemsPerRow={ Math.ceil(topOrgs.length / 2) }>
					{topOrgs.map((org) => (
						<OrgCard
							key={ org._id }
							org={ org }
							animateClass={ settings.animateOrgs }
							size='big'
						/>
					))}
				</Card.Group>
			</CardsContainer>
		</TopOrgsContainer>
	);
});

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

export default TopOrgs;
