import React, { useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import PledgeInfo from './PledgeInfo';
import Fireworks from '/imports/lib/Fireworks';
 
const PledgeDisplay = ({ pledge }) => {
	const canvasRef = useRef();
	let fireworks;
	let numFireworks = 3;
	if(pledge.amount > 10000) numFireworks++;
	if(pledge.amount > 50000) numFireworks++;
	if(pledge.amount > 100000) numFireworks++;

	useLayoutEffect(() => {
		fireworks = new Fireworks(canvasRef.current);
		fireworks.fire(numFireworks, numFireworks * 500);
	});

	console.log({ pledge });
	
	return (
		<>
			<PledgeInfo pledge={ pledge } />
			<canvas ref={ canvasRef } />
		</>
	);
};

PledgeDisplay.propTypes = {
	pledge: PropTypes.object
};

export default PledgeDisplay;