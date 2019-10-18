import React from 'react';
import PropTypes from 'prop-types';

import { Container } from 'semantic-ui-react';
import styled from 'styled-components';

const WelcomeContainer = styled.div`
	width: 100%;
	height: 100%;
	background: #0E8743;
	color: white;
	overflow: hidden;

	h1{
		color: white;
	}
`;

const Centered = styled.div`
	margin: 0 auto;
	position: relative;
	top: 50%;
	transform: translateY(-50%);
`;

const PageTitle = styled.h1`
	color: white;
	text-align: center;
`;

const WelcomeLayout = ({ children }) => {
	return (
		<WelcomeContainer id="welcomeContainer">
			<Centered id="centered">
				<Container id="container">
					{ children }
				</Container>
			</Centered>
		</WelcomeContainer>
	);
};

WelcomeLayout.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
};

export default WelcomeLayout;
