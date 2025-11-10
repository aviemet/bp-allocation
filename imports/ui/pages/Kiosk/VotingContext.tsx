import { forEach, find, clone } from "lodash"
import { observer } from "mobx-react-lite"
import { useState, type ReactNode } from "react"
import { useTheme, useOrgs } from "/imports/api/providers"
import { MemberMethods } from "/imports/api/methods"
import { MemberWithTheme } from "/imports/server/transformers/memberTransformer"
import { createContext } from "/imports/lib/hooks/createContext"
import { VotingSource } from "/imports/api/methods/MemberMethods"


interface VotingContextValue {
	allocations: Record<string, number>
	updateAllocations: (org: string, amount: number) => void
	saveAllocations: (source?: VotingSource) => void
	chits: Record<string, number>
	updateChits: (org: string, count: number) => void
	saveChits: (source?: VotingSource) => void
	member: MemberWithTheme
	unsetUser: () => void
}

interface VotingContextProviderProps {
	children: ReactNode
	member: MemberWithTheme
	unsetUser: () => void
}

const [useVoting, FundsVoteContextProvider] = createContext<VotingContextValue>()

const FundsVoteProvider = observer(({ children, member, unsetUser }: VotingContextProviderProps) => {
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

	const saveAllocations = (source?: VotingSource) => {
		if(!theme) return
		forEach(allocations, (amount, org) => {
			const voteData: {
				theme: string
				member: string
				org: string
				amount: number
				voteSource?: VotingSource
			} = {
				theme: theme._id,
				member: member._id,
				org,
				amount,
			}
			if(source) {
				voteData.voteSource = source
			}
			MemberMethods.fundVote.callAsync(voteData as Parameters<typeof MemberMethods.fundVote.callAsync>[0])
		})
	}

	const saveChits = (source?: VotingSource) => {
		if(!theme) return

		forEach(chits, (votes, org) => {
			const voteData = {
				theme: theme._id,
				member: member._id,
				org,
				votes,
				voteSource: source,
			}

			MemberMethods.chitVote.call(voteData)
		})
	}

	return (
		<FundsVoteContextProvider value={ {
			allocations,
			updateAllocations,
			saveAllocations,
			chits,
			updateChits,
			saveChits,
			member,
			unsetUser,
		} }>
			{ children }
		</FundsVoteContextProvider>
	)
})

export { useVoting, FundsVoteProvider }
