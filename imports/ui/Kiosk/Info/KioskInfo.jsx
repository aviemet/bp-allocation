import React, { useEffect, useState } from 'react'

import { Card, Container, Header, Loader } from 'semantic-ui-react'
import styled from '@emotion/styled'

import { observer } from 'mobx-react-lite'
import { useTheme, useOrgs } from '/imports/api/providers'

import OrgCard from '/imports/ui/Components/Cards/OrgCard'
import { useWindowSize, breakpoints } from '/imports/ui/MediaProvider'

const KioskInfo = observer(() => {
	const { theme } = useTheme()
	const { orgs, topOrgs, isLoading: orgsLoading } = useOrgs()

	const [ itemsPerRow, setItemsPerRow ] = useState(3)

	const { width } = useWindowSize()

	useEffect(() => {
		let n = itemsPerRow
		if(width < breakpoints.tablet) n = 1
		else if(width >= breakpoints.tablet && width < breakpoints.tabletL) n = 2
		else n = 3

		if(itemsPerRow !== n) setItemsPerRow(n)
	}, [width])

	const title = theme.chitVotingStarted ?
		`TOP ${theme.numTopOrgs} ORGANIZATIONS` :
		'ORGANIZATIONS THIS THEME'

	let subHeading = ''
	if(!theme.chitVotingStarted && !theme.fundsVotingStarted) {
		subHeading = 'Round 1 Voting To Begin Shortly'
	} else if(theme.chitVotingStarted && !theme.fundsVotingStarted) {
		subHeading = 'Round 2 Voting To Begin Shortly'
	} else {
		subHeading = 'Votes Are In, Results Coming Soon'
	}

	const orgsToDisplay = theme.chitVotingStarted ? topOrgs : orgs.values

	if(orgsLoading) return <Loader active />
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
