import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { useTheme, useOrganizations } from '/imports/context';

import { MemberMethods } from '/imports/api/methods';

const FundsVoteContext = React.createContext();

const VotingContextProvider = props => {

	const { theme } = useTheme();
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
	};

	const saveVotes = () => {
		_.forEach(votes, (amount, org) => {
			MemberMethods.fundVote.call({
				theme: theme._id,
				member: props.member._id,
				org: org,
				amount: amount
			});
		});
	};

	return (
		<FundsVoteContext.Provider value={ {
			votes,
			updateVotes,
			saveVotes,
			member: props.member || false,
			unsetUser: props.unsetUser
		} }>
			{props.children}
		</FundsVoteContext.Provider>
	);
};

VotingContextProvider.propTypes = {
	member: PropTypes.object,
	unsetUser: PropTypes.func,
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
};

/**
 * Context hook
 */
const useVoting = () => useContext(FundsVoteContext);

export { VotingContextProvider, FundsVoteContext, useVoting };
