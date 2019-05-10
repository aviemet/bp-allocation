import { Meteor } from 'meteor/meteor';
import React from 'react';
import _ from 'lodash';

import { withTracker } from 'meteor/react-meteor-data';


import { Members } from '/imports/api';
import { MemberMethods } from '/imports/api/methods';

/**
 * Initialize the Context
 */
const MemberContext = React.createContext('theme');

/**
 * Create a Provider with its own API to act as App-wide state store
 */
const MemberProviderTemplate = props => {

	return (
		<MemberContext.Provider value={{
			members: props.members,
			membersLoading: props.loading
		}}>
			{props.children}
		</MemberContext.Provider>
	);
}

const MemberProvider = withTracker((props) => {
	if(!props.id) return { loading: true };

	// Get the theme
	let membersHandle = Meteor.subscribe('members', props.id);
	let members = Themes.find({_id: props.id}).fetch()[0];

	let loading = (!membersHandle.ready() || _.isUndefined(member));

	return { loading, members };
})(MemberProviderTemplate);

export { MemberContext, MemberProvider };
