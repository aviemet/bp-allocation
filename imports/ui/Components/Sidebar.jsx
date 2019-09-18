import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const SidebarContainer = styled.div`
	width: 150px;
`;

const Sidebar = props => {
	return (
		<SidebarContainer>
			{ props.children }
		</SidebarContainer>
	);
};

Sidebar.propTypes = {
	children: PropTypes.any
};

export default Sidebar;