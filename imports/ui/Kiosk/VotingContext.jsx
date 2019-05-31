import { Meteor } from 'meteor/meteor';
import React, { useState, useReducer, useContext, useEffect, useRef } from 'react';
import _ from 'lodash';

import { useTheme, useOrganizations, usePresentationSettings, useImages } from '/imports/context';

const FundsVoteContext = React.createContext();

const VotingContextProvider = props => {

	const { topOrgs, orgsLoading } = useOrganizations();

	let initialVotesState = {};
	if(!_.isUndefined(props.member) && !orgsLoading) {
		topOrgs.map(org => {
			const vote = _.find(props.member.theme.allocations, ['organization', org._id]);
			initialVotesState[org._id] = vote ? vote.amount : 0;
		});
	}

	const [ votes, setVotes ] = useState(initialVotesState);

	const updateVotes = (org, amount) => {
		let newVotes = _.clone(votes);
		newVotes[org] = amount;
		setVotes(newVotes);
	}

  return (
    <FundsVoteContext.Provider value={{
    	votes,
    	updateVotes,
    	member: props.member || false
    }}>
    	{props.children}
    </FundsVoteContext.Provider>
  )
}

const useVoting = () => useContext(FundsVoteContext);

export { VotingContextProvider, FundsVoteContext, useVoting };
