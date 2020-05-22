import React from 'react'
import PropTypes from 'prop-types'

import { useHistory } from 'react-router-dom'

import { Icon, Menu } from 'semantic-ui-react'
import styled from 'styled-components'

/**
 * MenuLink for Vertical Admin Menu
 */
const MenuLink = ({ children, as, to, target, active, iconPosition, className, ...rest }) => {
	const history = useHistory()

	// target='_blank' attributes should open links in new tab/window
	const handleNav = () => {
		if(target && target === '_blank') {
			window.open(to)
		} else {
			history.push(to)
		}
	}

	// Append 'left' class to classes if icon position should be to the left
	const classes = []
	if(iconPosition && iconPosition !== 'right') {
		classes.push(iconPosition)
	}

	return (
		<MenuItem 
			as={ as ? as : 'a' }
			to={ to }
			onClick={ handleNav } 
			active={ active && active }
			className={ classes.join(' ') }
			{ ...rest }
		>
			{ target === '_blank' && <Icon name='external' size='small' /> }{ children }
		</MenuItem>
	)
}

MenuLink.propTypes = {
	children: PropTypes.any,
	as: PropTypes.string,
	to: PropTypes.string,
	target: PropTypes.any,
	active: PropTypes.bool,
	iconPosition: PropTypes.oneOf(['left', 'right']),
	className: PropTypes.string,
	id: PropTypes.string,
	rest: PropTypes.any
}

const MenuItem = styled(Menu.Item)`
	&&&.left {
		i.icon {
			float: left;
			margin: 0 0.5em 0 0;
		}
	}
`

export default MenuLink