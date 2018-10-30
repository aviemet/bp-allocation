import React from 'react';

import { Container, Grid } from 'semantic-ui-react';
import styled from 'styled-components';

const AdminContainer = styled.div`
	background: #2b4a7c;
	width: 100%;
	min-height: 100%;
`;

const AdminLayout = (props) => (
	<AdminContainer>
		<Container>
			<Grid columns={16}>
				{props.children}
			</Grid>
		</Container>
	</AdminContainer>
);

export default AdminLayout;
