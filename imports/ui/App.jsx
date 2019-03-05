import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';

import { Grid, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import { ThemeMethods } from '/imports/api/methods';

import { AdminLayout, WelcomeLayout, PresentationLayout, KioskLayout } from '/imports/ui/Layouts';
import ThemesList from '/imports/ui/Welcome/ThemesList';
import Theme from '/imports/ui/Admin/Theme';
import Presentation from '/imports/ui/Presentation/Presentation';
import Simulation from '/imports/ui/Admin/Simulation';
import WelcomePage from '/imports/ui/Welcome/WelcomePage';
import Kiosk from '/imports/ui/Kiosk/Kiosk';

const browserHistory = createBrowserHistory();

export default class App extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Router history={browserHistory}>
				<Switch>
					<Route exact path="/" render={ (props ) => (
						<WelcomeLayout title="Allocation Night Themes">
							<ThemesList />
						</WelcomeLayout>)
					} />
					<Route exact path="/theme/:id" render={ (props) => (
						<WelcomeLayout title="How will this screen be used?">
							<WelcomePage id={props.match.params.id} />
						</WelcomeLayout>
					) } />
					<Route path="/admin/:id" render={ (props) => (
						<AdminLayout>
							<Theme id={props.match.params.id} />
						</AdminLayout>
					) } />
					<Route path="/presentation/:id" render={ (props) => (
						<PresentationLayout>
							<Presentation id={props.match.params.id} />
						</PresentationLayout>
					) } />
					<Route path="/simulation/:id" render= { (props) => (
						<PresentationLayout>
							<Simulation id={props.match.params.id} />
						</PresentationLayout>
					) } />
					<Route path="/kiosk/:id" render= { (props) => (
						<KioskLayout>
							<Kiosk id={props.match.params.id} />
						</KioskLayout>
					) } />
				</Switch>
			</Router>
		);
	}
}
