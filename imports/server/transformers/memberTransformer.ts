import { type MemberData, type MemberWithTheme } from "/imports/api/db"
import { type MemberTheme } from "/imports/types/schema"

export const MemberTransformer = (doc: MemberData, memberTheme?: MemberTheme): MemberWithTheme => ({
	...doc,
	theme: memberTheme,
})
