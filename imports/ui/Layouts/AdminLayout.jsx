import React from 'react';
import { Link } from 'react-router-dom';

import { Container, Grid, Button, Icon } from 'semantic-ui-react';
import styled from 'styled-components';

import HomeButton from '/imports/ui/Components/HomeButton';

const AdminContainer = styled.div`
	background: #2b4a7c;
	width: 100%;
	min-height: 100%;
`;

const AdminLayout = (props) => (
	<AdminContainer>
		<HomeButton />

		<Container>
			<Grid columns={ 16 }>
				{props.children}
			</Grid>
		</Container>
	</AdminContainer>
);

export default AdminLayout;
