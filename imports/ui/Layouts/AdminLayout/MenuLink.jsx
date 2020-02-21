import React from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';

import { Icon, Menu } from 'semantic-ui-react';
import styled from 'styled-components';

/**
 * MenuLink for Vertical Admin Menu
 */
const MenuLink = withRouter(props => {
	// target='_blank' attributes should open links in new tab/window
	const handleNav = () => {
		if(props.target && props.target === '_blank') {
			window.open(props.to);
		} else {
			props.history.push(props.to);
		}
	};

	// Append 'left' class to classes if icon position should be to the left
	let classes = props.className || '';
	if(props.iconPosition && props.iconPosition !== 'right') {
		classes += props.iconPosition;
	}

	return (
		<MenuItem 
			as='a' 
			to={ props.to } 
			onClick={ handleNav } 
			active={ props.active && props.active }
			className={ classes }
			id={ props.id ? props.id : '' }
		>
			{ props.target === '_blank' && <Icon name='external' size='small' /> }{ props.children }
		</MenuItem>
	);
});

MenuLink.propTypes = {
	children: PropTypes.any,
	as: PropTypes.string,
	to: PropTypes.string,
	target: PropTypes.any,
	active: PropTypes.bool,
	iconPosition: PropTypes.oneOf(['left', 'right']),
	className: PropTypes.string,
	id: PropTypes.string
};

const MenuItem = styled(Menu.Item)`
	&&&.left {
		i.icon {
			float: left;
			margin: 0 0.5em 0 0;
		}
	}
`;

export default MenuLink;