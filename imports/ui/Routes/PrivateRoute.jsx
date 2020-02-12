import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ location, component, render, children, ...rest }) => {
	// Allow for any of the methods for passing components
	const Component = render || component || children;

	return (
		<Route { ...rest } render={ props => (
			process.env.NODE_ENV !== 'development' && !Meteor.userId()
				? <Redirect to={ {
					pathname: '/login',
					state: { from: location }
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