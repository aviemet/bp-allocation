import React from 'react';

import { Grid, Card, Container, Header } from 'semantic-ui-react';
import styled from 'styled-components';

const KioskContainer = styled.div`
	width: 100%;
	height: 100%;
	background: black;
	color: white;
`;

export default class WelcomeLayout extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
		  <KioskContainer>
				<Container>
					{this.props.children}
				</Container>
			</KioskContainer>
		);
	}
}
