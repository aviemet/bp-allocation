import React from 'react';

import { Grid } from 'semantic-ui-react';
import styled from 'styled-components';

const Hr = (props) => (
	<Grid.Row>
		<Grid.Column>
			<PaddedImg src="/img/xxx_hr.svg" />
		</Grid.Column>
	</Grid.Row>
);

const PaddedImg = styled.img`
	margin: 15px 0;
`;

export default Hr;
