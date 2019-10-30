import React from 'react';
import PropTypes from 'prop-types';
import Graph from '/imports/ui/Presentation/Graph/Graph';
import PledgesOverlay from './PledgesOverlay';

const Allocation = ({ simulation }) => (
	<>
		<Graph simulation={ simulation || false } />
		<PledgesOverlay />
	</>
);

Allocation.propTypes = {
	simulation: PropTypes.bool
};

export default Allocation;
