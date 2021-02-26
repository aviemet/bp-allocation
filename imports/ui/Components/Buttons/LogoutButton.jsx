import { Meteor } from 'meteor/meteor'
import React from 'react'
import { useHistory } from 'react-router-dom'

import { Button, Icon } from 'semantic-ui-react'
import styled from 'styled-components'

const LogoutButton = () => {
	const history = useHistory()

	const handleLogout = () => {
		Meteor.logout(() => history.push('/login'))
	}

	return (
		<StyledLogoutButton icon onClick={ handleLogout }><Icon name='sign-out' /></StyledLogoutButton>
	)
}

const StyledLogoutButton = styled(Button)`
	&& {
		position: absolute;
		top: 2em;
		right: 6em;
	}
`

export default LogoutButton
