import { type MemberData } from "/imports/api/db"
import { type MemberTheme } from "/imports/types/schema"

export const MemberTransformer = (doc: MemberData, memberTheme?: MemberTheme) => {
	const result: Record<string, unknown> = {
		...doc,
		theme: memberTheme,
	}
	return result
}
