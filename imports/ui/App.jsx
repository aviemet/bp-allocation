import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';

import { Grid, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import { ThemeMethods } from '/imports/api/methods';

import ThemesList from '/imports/ui/Admin/ThemesList';
import Theme from '/imports/ui/Admin/Theme';
import PresentationLayout from '/imports/ui/Presentation/PresentationLayout';
import Presentation from '/imports/ui/Presentation/Presentation';
import AdminLayout from '/imports/ui/Admin/AdminLayout';
import Simulation from '/imports/ui/Admin/Simulation';

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
						<AdminLayout>
							<ThemesList />
						</AdminLayout>)
					} />
					<Route path="/theme/:id" render={ (props) => (
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
				</Switch>
			</Router>
		);
	}
}
