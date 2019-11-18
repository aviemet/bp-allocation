import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useData } from '/imports/stores/DataProvider';
import { observer } from 'mobx-react-lite';
// import { toJS } from 'mobx';
import { Queue } from '/imports/lib/utils';

import PledgeDisplay from './PledgeDisplay';

const pledgesToDisplay = new Queue();

const PledgesOverlay = observer(() => {
	const data = useData();
	const [ displayPledge, setDisplayPledge ] = useState();
	const [ animatingPledges, setAnimatingPledges ] = useState(false);

	// Listen for changes on the pledges Set from OrgsCollection
	useEffect(() => {
		// Compare all pledges to list of displayedPledges
		// DataStore initalizes with list of existing pledges to avoid displaying all 
		//   pledges at first display of page (only new pledges will display)
		data.orgs.pledges.forEach(pledge => {
			// Find any new pledges which haven't been displayed yet
			if(!data.displayedPledges.has(pledge._id)) {
				// Add any new pledges to local Queue
				pledgesToDisplay.enqueue(pledge);
				data.displayedPledges.add(pledge._id);
				// Start the animation if not already running
				if(!animatingPledges) setAnimatingPledges(true);
			}
		});
	}, [ data.orgs.pledges ]);

	useEffect(() => {
		// When animatingPledges becomes true, begin the animation
		if(animatingPledges) {
			animatePledges();
		}
	}, [ animatingPledges ]);

	const animatePledges = () => {
		setDisplayPledge(null);
		if(!pledgesToDisplay.isEmpty()) {
			const pledge = pledgesToDisplay.dequeue();
			console.log({ pledgesToDisplay });
			console.log({ pledge });
			setDisplayPledge(pledge);
			setTimeout(animatePledges, 5000);
		} else {
			setAnimatingPledges(false);
		}
	};

	return (
		<OverlayContainer>
			<CenteredDisplay>
				{ displayPledge && <PledgeDisplay pledge={ displayPledge } /> }
			</CenteredDisplay>
		</OverlayContainer>
	);
});

const OverlayContainer = styled.div`
	position: fixed;
	top: 0;
	height: 0;
	width: 100vw;
	height: 100vh;
`;

const CenteredDisplay = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%,-50%);
`;

export default PledgesOverlay;