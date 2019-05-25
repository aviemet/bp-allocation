import { Meteor } from 'meteor/meteor';
import React, { useState, useReducer, useContext, useEffect } from 'react';

import { useTheme, useOrganizations, usePresentationSettings, useImages } from '/imports/context';

const VoteContext = React.createContext();

const VotingContextProvider = props => {

	const { topOrgs } = useOrganizations();

	let initialVotesState = {};
	if(!_.isUndefined(props.member) && !orgsLoading) {
		// Init array of 0 values for votes for the toporgs
		topOrgs.map(org => {
			// Update the vote value if user has voted already
			const vote = _.find(props.member.theme.allocations, ['organization', org._id]);

			initialVotesState[org._id] = vote ? vote.amount : 0;
		});
	}

	const updateVotes = ({org, amount}) => {
		let newVotes = votes;
		newVotes[org] = amount;
		return newVotes;
	}

	const [ votes, dispatchVotes ] = useReducer(updateVotes, {});

  return (
    <FundsVoteContext.Provider value={{
    	votes: votes,
    	updateVotes: dispatchVotes
    }}>
    	{props.children}
    </FundsVoteContext.Provider>
  )
}

const useVoting = () => useContext(VoteContext);

export default { VotingContextProvider, useVoting };
