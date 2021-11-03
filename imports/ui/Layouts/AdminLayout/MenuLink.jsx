import React from 'react'
import PropTypes from 'prop-types'

import { Link } from 'react-router-dom'

import { Icon, Menu } from 'semantic-ui-react'
import classnames from 'classnames'

/**
 * MenuLink for Vertical Admin Menu
 */
const MenuLink = ({ children, as, to, target, active, iconPosition, className, ...rest }) => (
	<Menu.Item
		as={ as ? as : Link }
		to={ to }
		active={ active && active }
		className={ classnames(className, { [iconPosition]: iconPosition && iconPosition !== 'right' }) }
		target={ target ? target : undefined }
		{ ...rest }
	>
		{ target === '_blank' && <Icon name='external' size='small' /> }{ children }
	</Menu.Item>
)

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
