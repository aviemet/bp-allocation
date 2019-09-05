import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { createBrowserHistory as createHistory } from 'history';

import styled from 'styled-components';

import { AppProvider } from '/imports/context';

import { AdminLayout, AdminLayoutNew, WelcomeLayout, PresentationLayout, KioskLayout, FeedbackLayout } from '/imports/ui/Layouts';
import ThemesList from '/imports/ui/Welcome/ThemesList';
import Admin from '/imports/ui/Admin';
import Presentation from '/imports/ui/Presentation';
import Simulation from '/imports/ui/Admin/Simulation';
import WelcomePage from '/imports/ui/Welcome/WelcomePage';
import Kiosk from '/imports/ui/Kiosk';
import Feedback from '/imports/ui/Feedback';

import StoreTest from '/imports/stores/StoreTest';
import AppContext from '/imports/stores/AppContext';
import Login from '/imports/ui/Welcome/Login';

const GlobalContainer = styled.div`
	width: 100%;
	height: 100vh;
`;

const PrivateRoute = ({ component: Component, ...rest }) => (
	<Route { ...rest } render={ props => (
		!Meteor.userId() 
			? <Redirect to={ {
				pathname: '/login',
				state: { from: props.location }
			} } />
			: <Component { ...props } />
	) } />
);

PrivateRoute.propTypes = {
	component: PropTypes.any,
	location: PropTypes.object
};

const browserHistory = createHistory();

const App = (props) => {
	console.log({ user: Meteor.userId() });
	return (
		<GlobalContainer>
			<Router history={ browserHistory }>
				<Switch>

					<Route path="/login" render={ props => (
						!Meteor.userId() 
							? <WelcomeLayout><Login /></WelcomeLayout>
							: <Redirect to="/" />
					) } />

					<PrivateRoute exact path="/" component={ () => (
						<Redirect to="/themes" />
					) } />

					<AdminLayoutNew>
						<PrivateRoute path="/themes" component={ props => (
							<>
								<Route exact path='/themes' component={ ThemesList } />

								<Route exact path='/themes/:id' component={ WelcomePage } />
							</>
						) } />

						<PrivateRoute path="/admin/:id" component={ props => (
							<AppProvider id={ props.match.params.id }>
								{/* <AdminLayout> */}
								{/* <AdminLayoutNew> */}
								<Admin />
								{/* </AdminLayoutNew> */}
							</AppProvider>
						) } />
					</AdminLayoutNew>

					<PrivateRoute path="/simulation/:id" component={ props => (
						<AppProvider id={ props.match.params.id }>
							<PresentationLayout>
								<Simulation />
							</PresentationLayout>
						</AppProvider>
					) } />

					<PrivateRoute path="/feedback/:id" component={ props => (
						<AppProvider id={ props.match.params.id }>
							<FeedbackLayout>
								<Feedback />
							</FeedbackLayout>
						</AppProvider>
					) } />

					<Route path="/presentation/:id" render={ props => (
						<AppProvider id={ props.match.params.id }>
							<PresentationLayout>
								<Presentation />
							</PresentationLayout>
						</AppProvider>
					) } />

					<Route path="/kiosk/:id" render={ props => (
						<AppProvider id={ props.match.params.id }>
							<KioskLayout>
								<Kiosk />
							</KioskLayout>
						</AppProvider>
					) } />

					<Route exact path="/dev" render={ () => (
						<Redirect to="/dev/DRbZ2ob63kpyaidMc" />
					) } />

					<Route path="/dev/:id" render={ props => {
						return (
							<AppContext themeId={ props.match.params.id }>
								<AdminLayout>
									<StoreTest />
								</AdminLayout>
							</AppContext>
						);
					} } />

				</Switch>
			</Router>
		</GlobalContainer>
	);
};

App.propTypes = {
	match: PropTypes.object
};

export default App;