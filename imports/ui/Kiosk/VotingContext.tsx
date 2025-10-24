import React, { useState, useContext } from "react"
import PropTypes from "prop-types"
import { forEach, find, clone } from "lodash"

import { observer } from "mobx-react-lite"
import { useTheme, useOrgs } from "/imports/api/providers"

import { MemberMethods } from "/imports/api/methods"

const FundsVoteContext = React.createContext(null)

const VotingContextProvider = observer(({ children, member, unsetUser }) => {
	const { theme } = useTheme()
	const { orgs, topOrgs } = useOrgs()

	let initialVotesState = {}
	topOrgs.forEach(org => {
		const allocations = find(member.theme.allocations, ["organization", org._id])
		initialVotesState[org._id] = allocations ? allocations.amount : 0
	})

	let initialChitState = {}
	orgs.values.forEach(org => {
		const chits = find(member.theme.chitVotes, ["organization", org._id])
		initialChitState[org._id] = chits ? chits.votes : 0
	})

	const [ allocations, setAllocations ] = useState(initialVotesState)
	const [ chits, setChits ] = useState(initialChitState)

	const updateAllocations = (org, amount) => {
		let newVotes = clone(allocations)
		newVotes[org] = amount
		setAllocations(newVotes)
	}

	const updateChits = (org, count) => {
		let newVotes = clone(chits)
		newVotes[org] = count
		setChits(newVotes)
	}

	const saveAllocations = source => {
		forEach(allocations, (amount, org) => {
			const voteData = {
				theme: theme._id,
				member: member._id,
				org: org,
				amount: amount,
			}
			if(typeof source === "string") voteData.voteSource = source
			MemberMethods.fundVote.call(voteData)
		})
	}

	const saveChits = source => {
		forEach(chits, (votes, org) => {
			const voteData = {
				theme: theme._id,
				member: member._id,
				org,
				votes,
			}
			if(typeof source === "string") voteData.voteSource = source
			MemberMethods.chitVote.call(voteData)
		})
	}

	return (
		<FundsVoteContext.Provider value={ {
			allocations,
			updateAllocations,
			saveAllocations,
			chits,
			updateChits,
			saveChits,
			member: member || false,
			unsetUser: unsetUser,
		} }>
			{ children }
		</FundsVoteContext.Provider>
	)
})

VotingContextProvider.propTypes = {
	member: PropTypes.object.isRequired,
	unsetUser: PropTypes.func,
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]),
}

/**
 * Context hook
 */
const useVoting = () => useContext(FundsVoteContext)

export { VotingContextProvider, FundsVoteContext, useVoting }
