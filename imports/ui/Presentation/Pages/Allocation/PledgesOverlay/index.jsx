import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { useData, useOrgs } from '/imports/api/providers'

import { observer } from 'mobx-react-lite'
import Queue from '/imports/lib/Queue'

import PledgeDisplay from './PledgeDisplay'

const pledgesToDisplay = new Queue()

const PledgesOverlay = observer(() => {
	const data = useData()
	const { orgs } = useOrgs()

	const [ displayPledge, setDisplayPledge ] = useState()
	const [ animatingPledges, setAnimatingPledges ] = useState(false)

	// On first load, add existing pledges to observable data store
	useEffect(() => {
		orgs.values.forEach(org => {
			org.pledges.forEach(pledge => {
				data.displayedPledges.add(pledge._id)
			})
		})
	}, [])

	// Listen for changes on the pledges Set from OrgsCollection
	useEffect(() => {
		// Compare all pledges to list of displayedPledges to avoid displaying all 
		//   pledges at first display of page (only new pledges will display)
		orgs.pledges.forEach(pledge => {
			// Find any new pledges which haven't been displayed yet
			if(!data.displayedPledges.has(pledge._id)) {
				// Add any new pledges to local Queue
				pledgesToDisplay.enqueue(pledge)
				data.displayedPledges.add(pledge._id)
				// Start the animation if not already running
				if(!animatingPledges) setAnimatingPledges(true)
			}
		})
	}, [ orgs.pledges ])

	useEffect(() => {
		// When animatingPledges becomes true, begin the animation
		if(animatingPledges) {
			animatePledges()
		}
	}, [ animatingPledges ])

	const animatePledges = () => {
		setDisplayPledge(null)
		if(!pledgesToDisplay.isEmpty()) {
			const pledge = pledgesToDisplay.dequeue()
			setDisplayPledge(pledge)
			setTimeout(animatePledges, 10000)
		} else {
			setAnimatingPledges(false)
		}
	}

	return (
		<OverlayContainer>
			{ displayPledge && <PledgeDisplay pledge={ displayPledge } /> }
		</OverlayContainer>
	)
})

const OverlayContainer = styled.div`
	position: fixed;
	top: 0;
	height: 0;
	width: 100vw;
	height: 100vh;
`

export default PledgesOverlay