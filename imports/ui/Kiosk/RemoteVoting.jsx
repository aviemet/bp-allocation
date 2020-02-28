import React from 'react';
import PropTypes from 'prop-types';

import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { useMembers, useMember } from '/imports/api/providers';

import { VotingContextProvider } from './VotingContext';

import FundsVoting from './FundsVoting';
import { Loader } from 'semantic-ui-react';

const RemoteVoting = observer(props => {
	// Pull member data from Data Store
	// const { members, isLoading: membersLoading } = useMembers();
	const { members, isLoading: membersLoading } = useMember(props.member);

	console.log({ members });

	if(membersLoading || isEmpty(members)) return <Loader active />;

	// TODO: This should be a subscription to a single member
	const member = members.values.find(member => member._id === props.member);

	console.log({ members, member, membersLoading });

	if(membersLoading) return <Loader active />;
	if(!member) return (
		<h1>Member Not Found</h1>
	);
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
