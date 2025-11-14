import { forEach, find, isEqual } from "lodash"
import { useMemo, useState, useRef, useEffect, startTransition, type ReactNode } from "react"
import { useTheme, useOrgs } from "/imports/api/hooks"
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

const FundsVoteProvider = ({ children, member, unsetUser }: VotingContextProviderProps) => {
	const { theme } = useTheme()
	const { orgs, topOrgs } = useOrgs()

	const orgValues = useMemo(() => {
		if(!orgs) return []
		return orgs.slice()
	}, [orgs])

	const baseAllocations = useMemo(() => {
		if(!topOrgs || topOrgs.length === 0) return {}
		const state: Record<string, number> = {}
		topOrgs.forEach(org => {
			const allocations = find(member.theme?.allocations, ["organization", org._id])
			state[org._id] = allocations?.amount ?? 0
		})
		return state
	}, [member.theme?.allocations, topOrgs])

	const baseChits = useMemo(() => {
		if(!orgs || orgValues.length === 0) return {}
		const state: Record<string, number> = {}
		orgValues.forEach(org => {
			const chits = find(member.theme?.chitVotes, ["organization", org._id])
			state[org._id] = chits?.votes ?? 0
		})
		return state
	}, [member.theme?.chitVotes, orgValues, orgs])

	const [localAllocationEdits, setLocalAllocationEdits] = useState<Record<string, number>>({})
	const [localChitEdits, setLocalChitEdits] = useState<Record<string, number>>({})
	const baseAllocationsRef = useRef(baseAllocations)
	const baseChitsRef = useRef(baseChits)

	useEffect(() => {
		if(!isEqual(baseAllocationsRef.current, baseAllocations)) {
			baseAllocationsRef.current = baseAllocations
			startTransition(() => {
				setLocalAllocationEdits({})
			})
		}
	}, [baseAllocations])

	useEffect(() => {
		if(!isEqual(baseChitsRef.current, baseChits)) {
			baseChitsRef.current = baseChits
			startTransition(() => {
				setLocalChitEdits({})
			})
		}
	}, [baseChits])

	const allocations = useMemo(() => {
		const merged = { ...baseAllocations }
		Object.assign(merged, localAllocationEdits)
		return merged
	}, [baseAllocations, localAllocationEdits])

	const chits = useMemo(() => {
		const merged = { ...baseChits }
		Object.assign(merged, localChitEdits)
		return merged
	}, [baseChits, localChitEdits])

	const updateAllocations = (org: string, amount: number) => {
		const baseValue = baseAllocations[org] ?? 0
		setLocalAllocationEdits(previous => {
			if(amount === baseValue) {
				const updated = { ...previous }
				delete updated[org]
				return updated
			} else {
				return { ...previous, [org]: amount }
			}
		})
	}

	const updateChits = (org: string, count: number) => {
		const baseValue = baseChits[org] ?? 0
		setLocalChitEdits(previous => {
			if(count === baseValue) {
				const updated = { ...previous }
				delete updated[org]
				return updated
			} else {
				return { ...previous, [org]: count }
			}
		})
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

			MemberMethods.chitVote.callAsync(voteData)
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
}

export { useVoting, FundsVoteProvider }
