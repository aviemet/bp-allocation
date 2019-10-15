import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';

const PresentationContainer = styled.div`
	background: #000;
	width: 100%;
	min-height: 100%;
	color: #FFF;
	text-align: center;
	font-size: 16px;
	font-family: 'BentonMod';

  h2 {
		letter-spacing: 1px;
		color: white;
		text-transform: uppercase;
		font-size: 3.75em;
		font-family: 'TradeGothic';
	}
`;

const PresentationLayout = ({ children }) => (
	<PresentationContainer>
		{ children }
	</PresentationContainer>
);

PresentationLayout.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
};

export default PresentationLayout;
