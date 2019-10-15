import React from 'react';
import PropTypes from 'prop-types';

import Graph from '/imports/ui/Presentation/Graph/Graph';

const Allocation = ({ simulation }) => <Graph simulation={ simulation || false } />;

Allocation.propTypes = {
	simulation: PropTypes.bool
};

export default Allocation;
