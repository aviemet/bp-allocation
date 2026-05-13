import { useCallback } from "react"

import { useMembers } from "./useMembers"
import { type MemberWithTheme } from "/imports/api/db"

export const buildMemberCode = (initials: string, number: string | number): string => {
	return `${initials.trim().toUpperCase()}${number}`
}

export const useFindMemberByCode = () => {
	const { members, membersLoading } = useMembers()

	const findMemberByCode = useCallback((
		initials: string | undefined,
		number: string | number | undefined
	): MemberWithTheme | undefined => {
		if(!initials || !number) return undefined

		return members.find(member => (
			member.code === buildMemberCode(initials ?? "", number ?? "")
		))
	}, [members])

	const findMemberById = useCallback((memberId: string | undefined): MemberWithTheme | undefined => {
		if(!memberId) return undefined

		return members.find(m => m._id === memberId)
	}, [members])

	return { findMemberByCode, findMemberById, members, membersLoading }
}
