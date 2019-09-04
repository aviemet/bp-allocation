import React from 'react';
import PropTypes from 'prop-types';

import { Container, Grid } from 'semantic-ui-react';
import styled from 'styled-components';

import HomeButton from '/imports/ui/Components/HomeButton';
import LogoutButton from '/imports/ui/Components/LogoutButton';

const AdminContainer = styled.div`
	background: #2b4a7c;
	width: 100%;
	min-height: 100%;
`;

const AdminLayout = (props) => (
	<AdminContainer>
		<HomeButton />
		<LogoutButton />

		<Container>
			<Grid columns={ 16 }>
				{props.children}
			</Grid>
		</Container>
	</AdminContainer>
);

AdminLayout.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
};

export default AdminLayout;
