import React from 'react'
import { Link } from 'react-router-dom'

import { Button, Icon } from 'semantic-ui-react'
import styled from 'styled-components'

const HomeButton = () => (
	<Link to='/'>
		<StyledHomeButton icon><Icon name='home' /></StyledHomeButton>
	</Link>
)

const StyledHomeButton = styled(Button)`
	&& {
		position: absolute;
		top: 2em;
		right: 2em;
	}
`

export default HomeButton
