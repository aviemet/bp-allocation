import { type MemberTheme } from "/imports/types/schema"

export function buildMemberThemeLookupMap(rows: MemberTheme[], themeId: string): Map<string, MemberTheme> {
	const lookup = new Map<string, MemberTheme>()
	for(const row of rows) {
		if(row.theme === themeId && row.member) {
			lookup.set(row.member, row)
		}
	}
	return lookup
}
