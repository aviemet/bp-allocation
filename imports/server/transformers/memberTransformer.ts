import { type MemberTheme } from "/imports/types/schema"
import { type MemberData } from "/imports/api/db"

export interface MemberWithTheme extends MemberData {
	theme?: MemberTheme
}

const MemberTransformer = (doc: MemberWithTheme, memberTheme?: MemberTheme) => {
	doc.theme = memberTheme
	return doc
}

export default MemberTransformer
