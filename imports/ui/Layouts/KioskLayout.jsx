import React from 'react'
import PropTypes from 'prop-types'

import { Container } from '@mui/material'
import styled from '@emotion/styled'

const KioskLayout = ({ children }) => (
	<KioskContainer>
		<Container sx={ { minHeight: '100%', display: 'flex' } }>
			{ children }
		</Container>
	</KioskContainer>
)

const KioskContainer = styled.div`
	width: 100%;
	min-height: 100%;
	background: black;
	color: white;
	touch-action: manipulation;
	padding-bottom: 2rem;
`

KioskLayout.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
}

export default KioskLayout
