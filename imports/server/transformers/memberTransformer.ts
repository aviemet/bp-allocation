import { type MemberTheme } from "/imports/types/schema"
import { type MemberData } from "/imports/api/db"

export interface MemberWithTheme extends MemberData {
	theme?: MemberTheme
}

const MemberTransformer = (doc: MemberData, memberTheme?: MemberTheme) => {
	const result: Record<string, unknown> = {
		...doc,
		theme: memberTheme,
	}
	return result
}

export default MemberTransformer
