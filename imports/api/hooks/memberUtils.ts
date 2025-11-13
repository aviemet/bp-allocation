import { type MemberData } from "../db"

export const getFormattedName = (member: MemberData): string => {
	if(member.fullName) return member.fullName
	return `${member.firstName || ""} ${member.lastName || ""}`.trim()
}

