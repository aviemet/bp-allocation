import React from 'react';
import { Link } from 'react-router-dom';

import { Container, Grid, Button, Icon } from 'semantic-ui-react';
import styled from 'styled-components';

const AdminContainer = styled.div`
	background: #2b4a7c;
	width: 100%;
	min-height: 100%;
`;

const HomeButton = styled(Button)`
	&& {
		position: absolute;
		top: 2em;
		right: 2em;
	}
`;

const AdminLayout = (props) => (
	<AdminContainer>
		<Link to='/'>
			<HomeButton icon><Icon name='home' /></HomeButton>
		</Link>

		<Container>
			<Grid columns={16}>
				{props.children}
			</Grid>
		</Container>
	</AdminContainer>
);

export default AdminLayout;
