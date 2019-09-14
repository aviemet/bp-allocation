import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = props => {
	// Allow for any of the methods for passing components
	const Component = props.render || props.component || props.children;

	// Pull these out to pass remaining props
	let rest = Object.assign({}, props);
	delete rest.render;
	delete rest.component;
	delete rest.children;

	return (
		<Route { ...rest } render={ props => (
			!Meteor.userId() 
				? <Redirect to={ {
					pathname: '/login',
					state: { from: props.location }
				} } />
				: <Component { ...props } />
		) } />
	);
};

PrivateRoute.propTypes = {
	location: PropTypes.object,
	component: PropTypes.any,
	render: PropTypes.any,
	children: PropTypes.any
};

export default PrivateRoute;