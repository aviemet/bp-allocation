import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';

import { Themes, Members } from '/imports/api/db';

import { Loader } from 'semantic-ui-react';

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
		return <Loader active />;
	}

	if(props.theme && props.member) {
		// TODO: This is a hack because Redirect isn't working properly
		window.location.href = `/voting/${props.theme._id}/${props.member._id}`;
		return <Redirect push to={ `/voting/${props.theme._id}/${props.member._id}` } />;
	}

	return <Redirect to='/404' />;
});

export default ShortRoute;