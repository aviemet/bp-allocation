import React from 'react'
import { Container } from '@mui/material'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'
import { useOrgs, useSettings } from '/imports/api/providers'
import { OrgCard, OrgCardContainer } from '/imports/ui/Components/Cards'

const Overlay = () => (
	<DimOverlay>
		{/*<Image src='/img/BPLogo.svg' />*/}
	</DimOverlay>
)

const Orgs = observer(() => {
	const { settings } = useSettings()
	const { orgs, topOrgs }  = useOrgs()

	let colorOrgs = {}
	topOrgs.map((org, i) => {
		colorOrgs[org._id] = true
	})

	return (
		<OrgsContainer>
			<PageTitle>Participating Organizations</PageTitle>
			<Container maxWidth="xl" sx={ { height: '100%' } }>
				<OrgCardContainer centered cols={ 3 } sx={ { paddingBottom: 'clamp(0rem, -58.1818rem + 90.9091vh, 10rem)' } }>
					{ orgs.values.map((org, i) => {
						return <OrgCard
							key={ org._id }
							org={ org }
							index={ i }
							size='big'
							overlay={ settings.colorizeOrgs && colorOrgs[org._id] ? Overlay : false }
						/>
					}) }
				</OrgCardContainer>
			</Container>
		</OrgsContainer>
	)
})

const OrgsContainer = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	padding-top: 16px;
	padding-bottom: 16px;
	height: 100%;

	&& p{
		line-height: 1em;
	}
`

const PageTitle = styled.h2``

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

`

export default Orgs
