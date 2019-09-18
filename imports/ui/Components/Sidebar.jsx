import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const SidebarContainer = styled.div`
	position: fixed;
	top: 0;
	left: -150px;
	height: 100vh;
	width: 150px;
	transition: left 0.25s ease-in-out;

	&.visible {
		left: 0;
	}
`;

const Sidebar = props => {
	return (
		<SidebarContainer className={ props.visible && 'visible' }>
			{ props.children }
		</SidebarContainer>
	);
};

Sidebar.propTypes = {
	children: PropTypes.any,
	visible: PropTypes.bool
};

export default Sidebar;