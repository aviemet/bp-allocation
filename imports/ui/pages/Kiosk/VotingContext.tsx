import { forEach, find, clone } from "lodash"
import { observer } from "mobx-react-lite"
import React, { useState, useContext, createContext } from "react"
import { useTheme, useOrgs } from "/imports/api/providers"
import { MemberMethods } from "/imports/api/methods"
import { MemberWithTheme } from "/imports/server/transformers/memberTransformer"

interface VotingContextValue {
	allocations: Record<string, number>
	updateAllocations: (org: string, amount: number) => void
	saveAllocations: (source?: string) => void
	chits: Record<string, number>
	updateChits: (org: string, count: number) => void
	saveChits: (source?: string) => void
	member: MemberWithTheme | false
	unsetUser: () => void
}

interface VotingContextProviderProps {
	children: React.ReactNode
	member: MemberWithTheme
	unsetUser: () => void
}

const FundsVoteContext = createContext<VotingContextValue | null>(null)

const VotingContextProvider = observer(({ children, member, unsetUser }: VotingContextProviderProps) => {
	const { theme } = useTheme()
	const { orgs, topOrgs } = useOrgs()

	const initialVotesState: Record<string, number> = {}
	topOrgs.forEach(org => {
		const allocations = find(member.theme?.allocations, ["organization", org._id])
		initialVotesState[org._id] = allocations?.amount ?? 0
	})

	const initialChitState: Record<string, number> = {}
	if(orgs) {
		orgs.values.forEach(org => {
			const chits = find(member.theme?.chitVotes, ["organization", org._id])
			initialChitState[org._id] = chits?.votes ?? 0
		})
	}

	const [ allocations, setAllocations ] = useState(initialVotesState)
	const [ chits, setChits ] = useState(initialChitState)

	const updateAllocations = (org: string, amount: number) => {
		const newVotes = clone(allocations)
		newVotes[org] = amount
		setAllocations(newVotes)
	}

	const updateChits = (org: string, count: number) => {
		const newVotes = clone(chits)
		newVotes[org] = count
		setChits(newVotes)
	}

	const saveAllocations = (source?: string) => {
		if(!theme) return
		forEach(allocations, (amount, org) => {
			const voteData: {
				theme: string
				member: string
				org: string
				amount: number
				voteSource?: "kiosk" | "mobile"
			} = {
				theme: theme._id,
				member: member._id,
				org,
				amount,
			}
			if(source) {
				voteData.voteSource = source as "kiosk" | "mobile"
			}
			MemberMethods.fundVote.call(voteData as Parameters<typeof MemberMethods.fundVote.call>[0])
		})
	}

	const saveChits = (source?: string) => {
		if(!theme) return
		forEach(chits, (votes, org) => {
			const voteData: {
				theme: string
				member: string
				org: string
				votes: number
				voteSource?: "kiosk" | "mobile"
			} = {
				theme: theme._id,
				member: member._id,
				org,
				votes,
			}
			if(source) {
				voteData.voteSource = source as "kiosk" | "mobile"
			}
			MemberMethods.chitVote.call(voteData as Parameters<typeof MemberMethods.chitVote.call>[0])
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
			unsetUser,
		} }>
			{ children }
		</FundsVoteContext.Provider>
	)
})

/**
 * Context hook
 */
const useVoting = () => useContext(FundsVoteContext)

export { VotingContextProvider, FundsVoteContext, useVoting }
