import React, { useState } from 'react';

import { Responsive, Card, Container, Header, Loader } from 'semantic-ui-react';
import styled from 'styled-components';

import { observer } from 'mobx-react-lite';
import { useTheme, useSettings, useOrgs, useMembers } from '/imports/api/providers';

import OrgCard from '/imports/ui/Components/OrgCard';

const KioskInfo = observer(() => {
	const { theme } = useTheme();
	const { settings } = useSettings();
	const { orgs, topOrgs } = useOrgs();
	const { isLoading: membersLoading } = useMembers();

	const [ itemsPerRow, setItemsPerRow ] = useState(3);

	const handleScreenLayout = (e, { width }) => setItemsPerRow(width <= Responsive.onlyMobile.maxWidth ? 1 : 3);

	const title = orgs.topOrgsChosen ? 
		`TOP ${theme.numTopOrgs} ORGANIZATIONS` :
		'ORGANIZATIONS THIS THEME';

	let subHeading = '';
	if(settings.fundsVotingActive) {
		subHeading = 'Voting In Progress';
	} else {
		if(theme.votingStarted) {
			subHeading = 'Voting Has Completed';
		} else {
			subHeading = 'Voting To Begin Shortly';
		}
	}

	const orgsToDisplay = orgs.topOrgsChosen ? topOrgs : orgs.values;

	if(membersLoading) return <Loader active />;
	return (
		<OrgsContainer>
			<Header as='h1' className="title" style={ { fontSize: '10vw' } }>{ title }</Header>
			<Header as='h2' className='subheading'>{ subHeading }</Header>
			<Responsive 
				as={ Card.Group }
				fireOnMount
				onUpdate={ handleScreenLayout }
				centered 
				itemsPerRow={ itemsPerRow }
			>
				{orgsToDisplay.map(org => (
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

export default KioskInfo;
