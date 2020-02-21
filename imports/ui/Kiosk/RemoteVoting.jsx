import React from 'react';
import PropTypes from 'prop-types';

import { observer } from 'mobx-react-lite';
import { useMembers } from '/imports/api/providers';

import { VotingContextProvider } from './VotingContext';

import FundsVoting from './FundsVoting';
import { Loader } from 'semantic-ui-react';

const RemoteVoting = observer(props => {
	// Pull member data from Data Store
	const { members, isLoading: membersLoading } = useMembers();

	if(membersLoading) return <Loader active />;

	// TODO: This should be a subscription to a single member
	const member = members.values.find(member => member._id === props.member);

	return (
		<VotingContextProvider member={ member || false } unsetUser={ props.onVotingComplete } >
			<FundsVoting user={ member || false } source='mobile' />
		</VotingContextProvider>
	);
});

RemoteVoting.propTypes = {
	member: PropTypes.string.isRequired
};

export default RemoteVoting;
