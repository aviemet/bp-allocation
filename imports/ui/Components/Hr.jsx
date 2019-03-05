import React from 'react';

import { Grid, Card } from 'semantic-ui-react';
import styled from 'styled-components';

const PaddedImg = styled.img`
	margin: 15px 0;
`


const Hr = (props) => (
	<Grid.Row>
		<Grid.Column>
			<PaddedImg src="/img/xxx_hr.svg" />
		</Grid.Column>
	</Grid.Row>
);

export default Hr;
