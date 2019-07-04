import React from 'react';
import PropTypes from 'prop-types';

import { Container } from 'semantic-ui-react';
import styled from 'styled-components';

const KioskContainer = styled.div`
	width: 100%;
	height: 100%;
	background: black;
	color: white;
`;

const KioskLayout = (props) => (
	<KioskContainer>
		<Container>
			{props.children}
		</Container>
	</KioskContainer>
);

KioskLayout.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
};

export default KioskLayout;
