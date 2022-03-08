import React from 'react'

import { Card, Loader } from 'semantic-ui-react'
import styled from '@emotion/styled'

import { observer } from 'mobx-react-lite'
import { useOrgs, useSettings } from '/imports/api/providers'

import {
	Container
} from '@mui/material'
import OrgCard from '/imports/ui/Components/Cards/OrgCard'

const TopOrgs = observer(() => {
	const { settings, isLoading: settingsLoading } = useSettings()
	const { topOrgs, isLoading: orgsLoading } = useOrgs()

	if(settingsLoading || orgsLoading) return <Loader active />
	return (
		<TopOrgsContainer maxWidth="xl">
			<PageTitle>Top {topOrgs.length} Organizations</PageTitle>
			<CardsContainer>
				<Card.Group centered itemsPerRow={ Math.ceil(topOrgs.length / 2) } style={ { height: '100%' } }>
					{ topOrgs.map((org) => (
						<OrgCard
							key={ org._id }
							org={ org }
							animateClass={ settings.animateOrgs }
							size='big'
						/>
					)) }
				</Card.Group>
			</CardsContainer>
		</TopOrgsContainer>
	)
})

const TopOrgsContainer = styled(Container)`
	padding: 16px;
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
	height: 100%;
`

const PageTitle = styled.h2`
	padding: 2rem;
`

const CardsContainer = styled.div`
	flex: 1;
	width: 100%;
	margin: 0 auto;

	.ui.card {
		height: 45%;
		
		div.content p {
			color: #FFF;
		}
}

	.ui.cards > .card > .content:after, .ui.card > .content:after {
		content: none;
	}
`

export default TopOrgs
