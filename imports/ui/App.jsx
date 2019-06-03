import React from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';

import { Grid, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import { AppProvider } from '/imports/context';

import { AdminLayout, WelcomeLayout, PresentationLayout, KioskLayout, FeedbackLayout } from '/imports/ui/Layouts';
import ThemesList from '/imports/ui/Welcome/ThemesList';
import Admin from '/imports/ui/Admin';
import Presentation from '/imports/ui/Presentation';
import Simulation from '/imports/ui/Admin/Simulation';
import WelcomePage from '/imports/ui/Welcome/WelcomePage';
import Kiosk from '/imports/ui/Kiosk';
import Feedback from '/imports/ui/Feedback';

const GlobalContainer = styled.div`
	width: 100%;
	height: 100vh;
`;

const browserHistory = createBrowserHistory();

export default class App extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
		  <GlobalContainer>
				<Router history={browserHistory}>
					<Switch>

						<Route exact path="/" render={() => (
							<Redirect to="/themes" />
						)} />

						<Route path="/themes" render={ (props) => (
							<WelcomeLayout>
								<Route exact path='/themes' component={ThemesList} />

								<Route exact path='/themes/:id' component={WelcomePage} />
							</WelcomeLayout>
						)} />

						<Route path="/admin/:id" render={ (props) => (
		    			<AppProvider id={props.match.params.id}>
								<AdminLayout>
									<Admin />
								</AdminLayout>
							</AppProvider>
						) } />

						<Route path="/presentation/:id" render={ (props) => (
		    			<AppProvider id={props.match.params.id}>
								<PresentationLayout>
									<Presentation />
								</PresentationLayout>
							</AppProvider>
						) } />

						<Route path="/simulation/:id" render= { (props) => (
		    			<AppProvider id={props.match.params.id}>
								<PresentationLayout>
									<Simulation />
								</PresentationLayout>
							</AppProvider>
						) } />

						<Route path="/kiosk/:id" render= { (props) => (
		    			<AppProvider id={props.match.params.id}>
								<KioskLayout>
									<Kiosk />
								</KioskLayout>
							</AppProvider>
						) } />

						<Route path="/feedback/:id" render= { (props) => (
		    			<AppProvider id={props.match.params.id}>
								<FeedbackLayout>
									<Feedback />
								</FeedbackLayout>
							</AppProvider>
						) } />

					</Switch>
				</Router>
			</GlobalContainer>
		);
	}
}
