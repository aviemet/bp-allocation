import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

import { VotingContextProvider } from './VotingContext';

import FundsVotingKiosk from './FundsVoting';

const RemoteVoting = observer(props => {
	// Pull member data from Data Store
	const data = useData();
	const members = data.members.values;

	const member = _.find(members, member => member._id === props.member);

	return (
		<VotingContextProvider member={ member || false } unsetUser={ props.onVotingComplete } >
			<FundsVotingKiosk user={ member || false } />
		</VotingContextProvider>
	);
});

RemoteVoting.propTypes = {
	member: PropTypes.string.isRequired
};

export default RemoteVoting;
