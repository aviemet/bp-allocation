import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import _ from 'lodash';

import { withTracker } from 'meteor/react-meteor-data';

import { Members, MemberThemes } from '/imports/api';

/**
 * Initialize the Context
 */
const MemberContext = React.createContext();

/**
 * Create a Provider with its own API to act as App-wide state store
 */
const MemberProviderTemplate = props => {

	const aggregateMembers = () => {
		if(props.loading || _.isUndefined(props.members) || _.isUndefined(props.memberThemes)) return [];

		let members = props.members.map(member => {
			let memberTheme = _.find(props.memberThemes, ['member', member._id]);
			// console.log({member, memberTheme});
			return Object.assign({theme: memberTheme}, member);
		});
		return members;
	};

	return (
		<MemberContext.Provider value={{
			members: aggregateMembers(),
			memberThemes: props.memberThemes,
			membersLoading: props.loading,
			handles: Object.assign({
				members: props.membersHandle
			}, props.handles)
		}}>
			{props.children}
		</MemberContext.Provider>
	);
}

const MemberProvider = withTracker(props => {
	if(!props.id) return { loading: true };

	const memberThemes = MemberThemes.find({theme: props.id}).fetch();

	const memberIds = memberThemes.map(memberTheme => memberTheme.member);

	const membersHandle = Meteor.subscribe('members', memberIds);
	const members = Members.find({_id: {$in: memberIds}}).fetch();

	const loading = (!membersHandle.ready() || !props.handles.memberThemes.ready());

	return { loading, members, memberThemes, membersHandle };
})(MemberProviderTemplate);

const useMembers = () => useContext(MemberContext);

export { MemberContext, MemberProvider, useMembers };
