import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { createBrowserHistory as createHistory } from 'history';
import PrivateRoute from '/imports/ui/Components/PrivateRoute';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';
// import { AppProvider } from '/imports/context';
import { AdminLayout, AdminLayoutNew, AdminLayoutRoute, WelcomeLayout, PresentationLayout, KioskLayout, FeedbackLayout } from '/imports/ui/Layouts';
import Presentation from '/imports/ui/Presentation';
// import { useApp } from '/imports/stores/AppProvider';
import Login from '/imports/ui/Welcome/Login';
import { Loader } from 'semantic-ui-react';

const LoadingRoute = observer(({ component, render, children, ...rest }) => {
	const data = useData();

	// Allow for any of the methods for passing components
	const Component = render || component || children;
	const loading = data.loading;

	return (
		<Route { ...rest } render={ matchProps => {
			console.log({ matchProps });
			data.themeId = matchProps.match.params.id || undefined;
			if(loading) return <Loader active />;
			console.log({ Component });
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
				<PrivateRoute path={ ['/themes', '/admin'] } component={ AdminLayoutNew } />

				<LoadingRoute path='/presentation/:id' render={ () => (
					<PresentationLayout>
						<Presentation />
					</PresentationLayout>
				) } />

				{/* <AdminLayoutNew>
					<PrivateRoute exact path='/themes' component={ ThemesList } />
					<PrivateRoute exact path='/themes/:id' component={ WelcomePage } />

					<PrivateRoute exact path='/admin/:id' render={ matchProps => (
						<AppProvider id={ matchProps.match.params.id }>
							<Admin />
						</AppProvider>
					) } />
				</AdminLayoutNew> 

				<PrivateRoute path='/simulation/:id' component={ matchProps => (
					<AppProvider id={ matchProps.match.params.id }>
						<PresentationLayout>
							<Simulation />
						</PresentationLayout>
					</AppProvider>
				) } />

				<PrivateRoute path='/feedback/:id' component={ matchProps => (
					<AppProvider id={ matchProps.match.params.id }>
						<FeedbackLayout>
							<Feedback />
						</FeedbackLayout>
					</AppProvider>
				) } />

				<Route path='/presentation/:id' render={ matchProps => (
					<AppProvider id={ matchProps.match.params.id }>
						<PresentationLayout>
							<Presentation />
						</PresentationLayout>
					</AppProvider>
				) } />

				<Route path='/kiosk/:id' render={ matchProps => (
					<AppProvider id={ matchProps.match.params.id }>
						<KioskLayout>
							<Kiosk />
						</KioskLayout>
					</AppProvider>
				) } />

				<Route exact path='/dev' render={ () => (
					<Redirect to='/dev/DRbZ2ob63kpyaidMc' />
				) } />

				{/* <Route path='/dev/:id' render={ matchProps => {
					return (
						<AppContext themeId={ matchProps.match.params.id }>
							<AdminLayout>
								<StoreTest />
							</AdminLayout>
						</AppContext>
					);
				} } /> */}

			</Switch>
		</Router>
	);
});

export default Routes;