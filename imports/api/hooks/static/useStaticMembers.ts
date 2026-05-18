import { useCallback, useEffect, useMemo, useState } from "react"

import { callMembersGet, callMembersList } from "/imports/api/methods/staticReadCalls"
import { useData } from "/imports/api/providers"
import { filterCollection } from "/imports/lib/utils"
import { type MemberWithTheme, type MemberWithVoteSummary } from "/imports/api/db"
import { MEMBER_SEARCHABLE_FIELDS } from "/imports/api/hooks/useMembers"
import { memberVoteSummary } from "/imports/lib/allocation/memberVotes"

const attachMemberVoteSummary = (members: MemberWithTheme[]): MemberWithVoteSummary[] => {
	return members.map(member => ({
		...member,
		...memberVoteSummary(member.theme),
	}))
}

export const useStaticMembers = () => {
	const data = useData()
	const themeId = data?.themeId
	const [searchFilter, setSearchFilter] = useState<string | null>(null)

	const [state, setState] = useState<{
		members: MemberWithVoteSummary[]
		membersLoading: boolean
		error: Error | null
	}>({
		members: [],
		membersLoading: true,
		error: null,
	})

	const refresh = useCallback(async () => {
		if(!themeId) {
			setState({ members: [], membersLoading: true, error: null })
			return
		}
		setState(previous => ({ ...previous, membersLoading: true, error: null }))
		try {
			const raw = await callMembersList(themeId, false)
			const members = attachMemberVoteSummary(raw)
			setState({ members, membersLoading: false, error: null })
		} catch (caught) {
			const error = caught instanceof Error ? caught : new Error(String(caught))
			setState(previous => ({ ...previous, membersLoading: false, error }))
		}
	}, [themeId])

	useEffect(() => {
		queueMicrotask(() => {
			void refresh()
		})
	}, [refresh])

	const filteredMembers = useMemo(() => {
		if(!searchFilter || !state.members.length) return state.members
		return filterCollection(state.members, searchFilter, MEMBER_SEARCHABLE_FIELDS)
	}, [state.members, searchFilter])

	return {
		members: state.members,
		filteredMembers,
		membersLoading: state.membersLoading,
		searchFilter,
		setSearchFilter,
		searchableFields: MEMBER_SEARCHABLE_FIELDS,
		error: state.error,
		refresh,
	}
}

export const useStaticMember = (memberId: string) => {
	const data = useData()
	const themeId = data?.themeId

	const [state, setState] = useState<{
		member: MemberWithTheme | undefined
		memberLoading: boolean
		error: Error | null
	}>({
		member: undefined,
		memberLoading: true,
		error: null,
	})

	const refresh = useCallback(async () => {
		if(!themeId || !memberId) {
			setState({ member: undefined, memberLoading: true, error: null })
			return
		}
		setState(previous => ({ ...previous, memberLoading: true, error: null }))
		try {
			const member = await callMembersGet(memberId, themeId)
			setState({
				member: member ?? undefined,
				memberLoading: false,
				error: null,
			})
		} catch (caught) {
			const error = caught instanceof Error ? caught : new Error(String(caught))
			setState(previous => ({ ...previous, memberLoading: false, error }))
		}
	}, [themeId, memberId])

	useEffect(() => {
		queueMicrotask(() => {
			void refresh()
		})
	}, [refresh])

	return { ...state, refresh }
}
