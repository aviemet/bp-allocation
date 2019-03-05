import React from 'react';

import Hr from '/imports/ui/Components/Hr';
import { Grid, Card, Container, Header } from 'semantic-ui-react';
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

export default class WelcomeLayout extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<WelcomeContainer>
				<Container>
					<Centered>
						<PageTitle>{this.props.title}</PageTitle>
						<Hr/>
							{this.props.children}
						<Hr/>
					</Centered>
				</Container>
			</WelcomeContainer>
		);
	}
}