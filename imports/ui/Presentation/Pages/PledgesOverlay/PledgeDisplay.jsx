import React from 'react';
import PropTypes from 'prop-types';

const PledgeDisplay = props => {
	return (
		<h1>{ props.pledge.org.title }</h1>
	);
};

PledgeDisplay.propTypes = {
	pledge: PropTypes.object
};

export default PledgeDisplay;