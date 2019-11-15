import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useData } from '/imports/stores/DataProvider';
import { observer } from 'mobx-react-lite';
// import { toJS } from 'mobx';

const PledgesOverlay = observer(() => {
	const data = useData();

	useEffect(() => {
		// console.log({ pledges: data.pledgeQueue });
	}, [ data.pledgeQueue ]);

	return (
		<OverlayContainer>

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

export default PledgesOverlay;