import React from 'react'
import PropTypes from 'prop-types'

import { Container } from '@mui/material'
import styled from '@emotion/styled'

const KioskLayout = ({ children }) => (
	<KioskContainer>
		<Container sx={ { width: '100%', minHeight: '100vh' } }>
			{ children }
		</Container>
	</KioskContainer>
)

const KioskContainer = styled.div`
	width: 100%;
	height: 100%;
	min-height: 100vh;
	background: black;
	color: white;
	touch-action: manipulation;
`

KioskLayout.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
}

export default KioskLayout
