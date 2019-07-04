import React from 'react';
import PropTypes from 'prop-types';

import Graph from '/imports/ui/Presentation/Graph/Graph';

const Allocation = props => {
	return (
		<React.Fragment>
			<Graph simulation={ props.simulation || false } />
		</React.Fragment>
	);
};

Allocation.propTypes = {
	simulation: PropTypes.bool
};

export default Allocation;
