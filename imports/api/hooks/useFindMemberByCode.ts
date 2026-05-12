import { useCallback } from "react"

import { useMembers } from "./useMembers"
import { type MemberWithTheme } from "/imports/server/transformers/memberTransformer"

export const buildMemberCode = (initials: string, number: string | number): string => {
	return `${initials.trim().toUpperCase()}${number}`
}

export const useFindMemberByCode = () => {
	const { members, membersLoading } = useMembers()

	const findMemberByCode = useCallback((initials: unknown, number: unknown): MemberWithTheme | undefined => {
		const code = buildMemberCode(String(initials || ""), String(number || ""))
		return members.find(member => member.code === code)
	}, [members])

	return { findMemberByCode, membersLoading }
}
