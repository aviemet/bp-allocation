import { type MemberTheme } from "/imports/types/schema"

export const memberThemeContentSignature = (memberTheme: MemberTheme | undefined): string => {
	if(!memberTheme) {
		return ""
	}
	return JSON.stringify({
		amount: memberTheme.amount ?? null,
		chits: memberTheme.chits ?? null,
		allocations: memberTheme.allocations ?? [],
		chitVotes: memberTheme.chitVotes ?? [],
	})
}

export const findMemberThemeForMember = (
	memberThemes: MemberTheme[],
	memberId: string,
	themeId: string,
): MemberTheme | undefined =>
	memberThemes.find(row => row.member === memberId && row.theme === themeId)
