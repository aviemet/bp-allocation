import React from 'react'
import PropTypes from 'prop-types'

import styled from '@emotion/styled'

const PresentationLayout = ({ children }) => <PresentationContainer>{ children }</PresentationContainer>

const PresentationContainer = styled.div`
	background: #000;
	width: 100%;
	height: 100%;
	min-height: 100vh;
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
`

PresentationLayout.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
}

export default PresentationLayout
