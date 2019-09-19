import React from 'react';

import { Card, Container, Header } from 'semantic-ui-react';
import styled from 'styled-components';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

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

const KioskInfo = observer(props => {
	const data = useData();
	const orgs = data.orgs.values;

	return (
		<OrgsContainer>
			<Header as='h1' id="title">ORGANIZATIONS THIS THEME</Header>
			<Card.Group centered itemsPerRow={ 3 }>
				{orgs.map((org, i) => (
					<OrgCard
						key={ org._id }
						org={ org }
					/>
				))}
			</Card.Group>
		</OrgsContainer>
	);
});

export default KioskInfo;
