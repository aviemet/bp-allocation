import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { createBrowserHistory as createHistory } from 'history';
import { withTracker } from 'meteor/react-meteor-data';
import PrivateRoute from '/imports/ui/Components/PrivateRoute';
import { useData } from '/imports/stores/DataProvider';
import { Themes, Members } from '/imports/api';

import { Loader } from 'semantic-ui-react';
import { observer } from 'mobx-react-lite';

import { AdminLayout, WelcomeLayout, PresentationLayout, KioskLayout, FeedbackLayout } from '/imports/ui/Layouts';
import Presentation from '/imports/ui/Presentation';
import Simulation from '/imports/ui/Admin/Simulation';
import Pledges from '/imports/ui/Pledges';
import Login from '/imports/ui/Welcome/Login';
import Kiosk from '/imports/ui/Kiosk';
import Feedback from '/imports/ui/Feedback';
import FourOhFour from './404';

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

const ShortRoute = withTracker((matchProps) => {
	const { themeSlug, memberCode } = matchProps.match.params;

	const themeSubscription = Meteor.subscribe('themes');
	const membersSubscription = Meteor.subscribe('members');

	return {
		loading: !themeSubscription.ready() || !membersSubscription.ready(),
		theme: Themes.find({ slug: themeSlug }).fetch()[0],
		member: Members.find({ code: memberCode }).fetch()[0],
		route: matchProps
	};
})(props => {
	if(props.loading) {
		console.log({ route: props.route });
		return <Loader active />;
	}

	if(props.theme && props.member) {
		// TODO: This is a hack because Redirect isn't working properly
		window.location.href = `/voting/${props.theme._id}/${props.member._id}`;
		return <Redirect push to={ `/voting/${props.theme._id}/${props.member._id}` } />;
	}

	return <Redirect to='/404' />;
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
				<Route path='/v/:themeSlug/:memberCode' component={ ShortRoute } />

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

				<LoadingRoute path='/pledges/:id' render={ () => (
					<KioskLayout>
						<Pledges />
					</KioskLayout>
				) } />

				<LoadingRoute path='/feedback/:id' render={ () => (
					<FeedbackLayout>
						<Feedback />
					</FeedbackLayout>
				) } />

				<Route path='/404' component={ FourOhFour } />

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