import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import classnames from 'classnames'

const Sidebar = ({ visible, children }) => (
	<SidebarContainer className={ classnames({ visible }) }>
		{ children }
	</SidebarContainer>
)

const SidebarContainer = styled.div`
	position: fixed;
	top: 0;
	left: -150px;
	height: 100vh;
	width: 150px;
	transition: left 0.25s ease-in-out;
	z-index: 1000;

	&.visible {
		left: 0;
	}
`

Sidebar.propTypes = {
	children: PropTypes.any,
	visible: PropTypes.bool
}

export default Sidebar
