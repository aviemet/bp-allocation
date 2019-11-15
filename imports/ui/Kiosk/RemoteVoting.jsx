import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

import { VotingContextProvider } from './VotingContext';

import FundsVoting from './FundsVoting';

const RemoteVoting = observer(props => {
	// Pull member data from Data Store
	const data = useData();
	const members = data.members.values;

	const member = _.find(members, member => member._id === props.member);

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
