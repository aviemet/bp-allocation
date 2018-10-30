import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';

import ThemesList from '/imports/ui/ThemesList';
import Theme from '/imports/ui/Theme/Theme';

const browserHistory = createBrowserHistory();

export default class Routes extends React.Component {

	constructor(props) {
		super(props);
	}

	render(){
		return(
			<Router history={browserHistory}>
				<Switch>
					<Route exact path="/" component={ThemesList} />
					<Route path="/theme/:id" render={ (props) => <Theme id={props.match.params.id} /> } />
				</Switch>
			</Router>
		)
	}
}
