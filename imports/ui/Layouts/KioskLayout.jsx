import React from 'react';

import { Container } from 'semantic-ui-react';
import styled from 'styled-components';

const KioskContainer = styled.div`
	width: 100%;
	height: 100%;
	background: black;
	color: white;
`;

const WelcomeLayout = (props) => (
  <KioskContainer>
		<Container>
			{props.children}
		</Container>
	</KioskContainer>
);

export default WelcomeLayout;
