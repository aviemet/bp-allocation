import { forEach, find, clone, isEqual } from "lodash"
import { observer } from "mobx-react-lite"
import { useEffect, useMemo, useState, type ReactNode } from "react"
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

	const initialVotesState = useMemo(() => {
		const state: Record<string, number> = {}
		topOrgs.forEach(org => {
			const allocations = find(member.theme?.allocations, ["organization", org._id])
			state[org._id] = allocations?.amount ?? 0
		})
		return state
	}, [member.theme?.allocations, topOrgs])

	const orgValues = useMemo(() => {
		if(!orgs) return []
		return orgs.values.slice()
	}, [orgs])

	const initialChitState = useMemo(() => {
		const state: Record<string, number> = {}
		orgValues.forEach(org => {
			const chits = find(member.theme?.chitVotes, ["organization", org._id])
			state[org._id] = chits?.votes ?? 0
		})
		return state
	}, [member.theme?.chitVotes, orgValues])

	const [ allocations, setAllocations ] = useState(initialVotesState)
	const [ chits, setChits ] = useState(initialChitState)

	useEffect(() => {
		if(!topOrgs || topOrgs.length === 0) return
		const nextAllocations: Record<string, number> = {}
		topOrgs.forEach(org => {
			const allocation = find(member.theme?.allocations, ["organization", org._id])
			nextAllocations[org._id] = allocation?.amount ?? 0
		})
		setAllocations(previous => {
			return isEqual(previous, nextAllocations) ? previous : nextAllocations
		})
	}, [member.theme?.allocations, topOrgs])

	useEffect(() => {
		if(!orgs) return
		const orgsCount = orgValues.length
		if(orgsCount === 0) return
		const nextChits: Record<string, number> = {}
		orgValues.forEach(org => {
			const chitsValue = find(member.theme?.chitVotes, ["organization", org._id])
			nextChits[org._id] = chitsValue?.votes ?? 0
		})
		setChits(previous => {
			return isEqual(previous, nextChits) ? previous : nextChits
		})
	}, [member.theme?.chitVotes, orgs, orgValues])

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
