import React from 'react';
import PropTypes from 'prop-types';

import Hr from '/imports/ui/Components/Hr';
import { Container } from 'semantic-ui-react';
import styled from 'styled-components';

const WelcomeContainer = styled.div`
	width: 100%;
	height: 100%;
	background: #0E8743;
	color: white;

	h1{
		color: white;
	}
`;

const Centered = styled.div`
	width: 100%;
	height: 100%;
	margin: 0 auto;
	position: relative;
	top: 50vh;
	transform: translateY(-50%);
`;

const PageTitle = styled.h1`
	color: white;
	text-align: center;
`;
const WelcomeLayout = (props) => {
	return (
		<WelcomeContainer>
			<Container>
				<Centered>
					<PageTitle>{props.title}</PageTitle>
					<Hr/>
					{props.children}
					<Hr/>
				</Centered>
			</Container>
		</WelcomeContainer>
	);
};

WelcomeLayout.propTypes = {
	title: PropTypes.string,
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
};

export default WelcomeLayout;
