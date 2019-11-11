import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { createBrowserHistory as createHistory } from 'history';
import PrivateRoute from '/imports/ui/Components/PrivateRoute';
import { Themes, Members } from '/imports/api';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';
import { AdminLayout, WelcomeLayout, PresentationLayout, KioskLayout, FeedbackLayout } from '/imports/ui/Layouts';
import Presentation from '/imports/ui/Presentation';
import Simulation from '/imports/ui/Admin/Simulation';

import Login from '/imports/ui/Welcome/Login';
import Kiosk from '/imports/ui/Kiosk';
import FourOhFour from './404';
import { Loader } from 'semantic-ui-react';
import VotingComplete from './Kiosk/VotingComplete';

// Route which delays display of content until the data store has fully loaded
const LoadingRoute = observer(({ component, render, children, ...rest }) => {
	const data = useData();

	// Allow for any of the methods for passing components
	const Component = render || component || children;
	const loading = data.loading;
	const { theme } = data;

	return (
		<Route { ...rest } render={ matchProps => {
			data.themeId = matchProps.match.params.id || undefined;
			if(loading) return <Loader active />;
			if(!loading && !theme) return <Redirect to='/404' />;
			return <Component />;
		} } />
	);

});

const browserHistory = createHistory();

const Routes = observer(() => {
	return(
		<Router history={ browserHistory }>
			<Switch>

				<Route path='/login' render={ matchProps => (
					!Meteor.userId() 
						? <WelcomeLayout><Login /></WelcomeLayout>
						: <Redirect to='/' />
				) } />
				
				<Redirect exact from='/' to='/themes' />
				<PrivateRoute path={ ['/themes', '/admin'] } component={ AdminLayout } />

				<LoadingRoute path='/presentation/:id' render={ () => (
					<PresentationLayout>
						<Presentation />
					</PresentationLayout>
				) } />

				{/* Short URL for texts */}
				<Route path='v/:shortId/:code' render={ matchProps => {
					const { shortId, code } = matchProps.params.id;
					const theme = Themes.find({ shortId }, { _id: true }).fetch();
					const member = Members.find({ code }, { _id: true }).fetch();

					if(theme.length > 0 && member.length > 0) {
						return <Redirect to={ `/voting/${theme._id}/${member._id}` } />;
					}
					return <Redirect to='404' />;
				} } />

				<LoadingRoute path={ ['/voting/:id/:member', '/kiosk/:id'] } render={ () => (
					<KioskLayout>
						<Kiosk />
					</KioskLayout>
				) } />

				<LoadingRoute path='/simulation/:id' render={ () => (
					<PresentationLayout>
						<Simulation />
					</PresentationLayout>
				) } />

				<Route path='/404' component={ FourOhFour } />

				{/* 
				<PrivateRoute path='/feedback/:id' component={ matchProps => (
					<AppProvider id={ matchProps.match.params.id }>
						<FeedbackLayout>
							<Feedback />
						</FeedbackLayout>
					</AppProvider>
				) } /> */}

			</Switch>
		</Router>
	);
});

LoadingRoute.propTypes = {
	component: PropTypes.oneOfType([ PropTypes.element, PropTypes.node, PropTypes.func ]), 
	render: PropTypes.oneOfType([ PropTypes.element, PropTypes.node, PropTypes.func ]), 
	children: PropTypes.oneOfType([ PropTypes.element, PropTypes.node, PropTypes.func ]),
	rest: PropTypes.any
};

export default Routes;