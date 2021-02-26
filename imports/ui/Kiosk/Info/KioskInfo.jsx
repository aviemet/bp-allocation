import React, { useState } from 'react'

import { Responsive, Card, Container, Header, Loader } from 'semantic-ui-react'
import styled from 'styled-components'

import { observer } from 'mobx-react-lite'
import { useTheme, useSettings, useOrgs, useMembers } from '/imports/api/providers'

import OrgCard from '/imports/ui/Components/Cards/OrgCard'
import { Media } from '/imports/ui/MediaProvider'

const KioskInfo = observer(() => {
	const { theme } = useTheme()
	const { orgs, topOrgs } = useOrgs()
	const { isLoading: membersLoading } = useMembers()

	const [ itemsPerRow, setItemsPerRow ] = useState(3)

	const handleScreenLayout = (e, { width }) => setItemsPerRow(width <= Responsive.onlyMobile.maxWidth ? 1 : 3)

	const title = theme.chitVotingStarted ?
		`TOP ${theme.numTopOrgs} ORGANIZATIONS` :
		'ORGANIZATIONS THIS THEME'

	let subHeading = ''
	/*if(settings.fundsVotingActive || settings.chitVotingActive) {
		subHeading = 'Voting In Progress'
	} else {
		if(theme.fundsVotingStarted) {
			subHeading = 'Voting Has Completed'
		} else {
			subHeading = 'Voting To Begin Shortly'
		}
	}*/

	if(!theme.chitVotingStarted && !theme.fundsVotingStarted) {
		subHeading = 'Round 1 Voting To Begin Shortly'
	} else if(theme.chitVotingStarted && !theme.fundsVotingStarted) {
		subHeading = 'Round 2 Voting To Begin Shortly'
	} else {
		subHeading = 'Votes Are In, Results Coming Soon'
	}

	const orgsToDisplay = theme.chitVotingStarted ? topOrgs : orgs.values

	if(membersLoading) return <Loader active />
	return (
		<OrgsContainer>
			<FlexHeading as='h1'>{ title }</FlexHeading>
			<Header as='h2'>{ subHeading }</Header>
			<Card.Group
				// onUpdate={ handleScreenLayout }
				centered
				itemsPerRow={ itemsPerRow }
			>
				{ orgsToDisplay.map(org => (
					<OrgCard
						key={ org._id }
						org={ org }
						info={ true }
					/>
				)) }
			</Card.Group>
		</OrgsContainer>
	)
})

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

	&& {
		.ui.header {
			color: #FFF;
			text-align: center;
		}

		p {
			line-height: 1em;
		}
	}
`

const FlexHeading = styled(Header)`
	font-size: 3em;
	text-align: center;

	@media only screen and (max-width: 500px) {
		font-size: 10vw !important;
	}
`

export default KioskInfo
