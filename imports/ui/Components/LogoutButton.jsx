import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Button, Icon } from 'semantic-ui-react';
import styled from 'styled-components';

const StyledLogoutButton = styled(Button)`
	&& {
		position: absolute;
		top: 2em;
		right: 6em;
	}
`;

const LogoutButton = ({ history }) => {
	const handleLogout = () => {
		Meteor.logout(() => history.push('/login'));
	};

	return (
		<StyledLogoutButton icon onClick={ handleLogout }><Icon name='sign-out' /></StyledLogoutButton>
	);
};

LogoutButton.propTypes = {
	history: PropTypes.object
};

export default withRouter(LogoutButton);
