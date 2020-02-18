import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { useData, useTheme } from '/imports/api/providers';
import { Route, Redirect } from 'react-router-dom';
import { Loader } from 'semantic-ui-react';

// Route which delays display of content until the theme data has fully loaded
const LoadingRoute = observer(({ component, render, children, ...rest }) => {
	const data = useData();
	const { theme, isLoading } = useTheme();
	console.log({ data });

	// Allow for any of the methods for passing components
	const Component = render || component || children;

	return (
		<Route { ...rest } render={ matchProps => {
			data.themeId = matchProps.match.params.id || undefined;
			if(isLoading) return <Loader active />;
			if(!isLoading && !theme) return <Redirect to='/404' />;
			return <Component />;
		} } />
	);

});

LoadingRoute.propTypes = {
	component: PropTypes.oneOfType([ PropTypes.element, PropTypes.node, PropTypes.func ]), 
	render: PropTypes.oneOfType([ PropTypes.element, PropTypes.node, PropTypes.func ]), 
	children: PropTypes.oneOfType([ PropTypes.element, PropTypes.node, PropTypes.func ]),
	rest: PropTypes.any
};

export default LoadingRoute;
