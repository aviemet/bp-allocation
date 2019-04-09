import React from 'react';

import { Card, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import OrgCard from '/imports/ui/Components/OrgCard';

import { COLORS } from '/imports/utils';

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
`

const TopOrgs = (props) => {
	return (
		<TopOrgsContainer>
			<PageTitle>Top {props.orgs.length} Organizations</PageTitle>
			<CardsContainer>
				<Card.Group centered itemsPerRow={Math.ceil(props.orgs.length / 2)}>
				{props.orgs.map((org, i) => (
					<OrgCard
						org={org}
						key={org._id}
						animateClass={props.animate}
						bgcolor={COLORS[i % COLORS.length]}
					/>
				))}
				</Card.Group>
			</CardsContainer>
		</TopOrgsContainer>
	);
}

export default TopOrgs;
