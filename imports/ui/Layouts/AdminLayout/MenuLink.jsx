import React from 'react'
import PropTypes from 'prop-types'

import { useHistory } from 'react-router-dom'

import { Icon, Menu } from 'semantic-ui-react'
import classnames from 'classnames'

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

	return (
		<Menu.Item
			as={ as ? as : 'a' }
			to={ to }
			onClick={ handleNav }
			active={ active && active }
			className={ classnames(className, { [iconPosition]: iconPosition && iconPosition !== 'right' }) }
			{ ...rest }
		>
			{ target === '_blank' && <Icon name='external' size='small' /> }{ children }
		</Menu.Item>
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

export default MenuLink
