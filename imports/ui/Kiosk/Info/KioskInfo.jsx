import React, { useState } from 'react';

import { Responsive, Card, Container, Header } from 'semantic-ui-react';
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

	& {
		h1.ui.header.title {
			color: #FFF;
			text-align: center;
			font-size: 3rem;
		}

		.subheading {
			color: #FFF;
			text-align: center;
		}

		p {
			line-height: 1em;
		}
	}
`;

const KioskInfo = observer(() => {
	const data = useData();
	const orgs = data.orgs.topOrgsChosen ? data.orgs.topOrgs : data.orgs.values;

	const [ itemsPerRow, setItemsPerRow ] = useState(3);

	const handleScreenLayout = (e, { width }) => setItemsPerRow(width <= Responsive.onlyMobile.maxWidth ? 1 : 3);

	const title = data.orgs.topOrgsChosen ? 
		`TOP ${data.theme.numTopOrgs} ORGANIZATIONS` :
		'ORGANIZATIONS THIS THEME';

	let subHeading = '';
	if(data.settings.fundsVotingActive) {
		subHeading = 'Voting In Progress';
	} else {
		if(data.theme.votingStarted) {
			subHeading = 'Voting Has Completed';
		} else {
			subHeading = 'Voting To Begin Shortly';
		}
	}

	return (
		<OrgsContainer>
			<Header as='h1' className="title">{ title }</Header>
			<Header as='h2' className='subheading'>{ subHeading }</Header>
			<Responsive 
				as={ Card.Group }
				fireOnMount
				onUpdate={ handleScreenLayout }
				centered 
				itemsPerRow={ itemsPerRow }
			>
				{orgs.map(org => (
					<OrgCard
						key={ org._id }
						org={ org }
						info={ true }
					/>
				))}
			</Responsive>
		</OrgsContainer>
	);
});

export default KioskInfo;
