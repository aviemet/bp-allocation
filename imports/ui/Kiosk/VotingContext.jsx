import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

import { MemberMethods } from '/imports/api/methods';

const FundsVoteContext = React.createContext();

const VotingContextProvider = observer(props => {
	const data = useData();
	const { theme } = data;
	const topOrgs = data.orgs.topOrgs;

	let initialVotesState = {};
	topOrgs.map(org => {
		const vote = _.find(props.member.theme.allocations, ['organization', org._id]);
		initialVotesState[org._id] = vote ? vote.amount : 0;
	});

	const [ votes, setVotes ] = useState(initialVotesState);

	const updateVotes = (org, amount) => {
		let newVotes = _.clone(votes);
		newVotes[org] = amount;
		setVotes(newVotes);
	};

	const saveVotes = source => {
		_.forEach(votes, (amount, org) => {
			const voteData = {
				theme: theme._id,
				member: props.member._id,
				org: org,
				amount: amount
			};
			if(typeof source === 'string') voteData.voteSource = source;
			MemberMethods.fundVote.call(voteData);
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
});

VotingContextProvider.propTypes = {
	member: PropTypes.object.isRequired,
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
