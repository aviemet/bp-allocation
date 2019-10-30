import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

import { VotingContextProvider } from './VotingContext';

import FundsVotingKiosk from './FundsVoting';
import KioskInfo from './Info/KioskInfo';

const RemoteVoting = observer(props => {
	// Pull member data from Data Store
	const data = useData();
	const members = data.members.values;

	const member = _.find(members, member => member._id === props.member);
	const [ user, setUser ] = useState(member || false);

	if(!user) {
		return <KioskInfo />;
	}

	return (
		<VotingContextProvider member={ user } unsetUser={ () => setUser(false) } >
			<FundsVotingKiosk user={ user } />
		</VotingContextProvider>
	);
});

RemoteVoting.propTypes = {
	member: PropTypes.string.isRequired
};

export default RemoteVoting;
