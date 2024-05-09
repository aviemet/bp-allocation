type MemberThemeParams = {
	memberTheme: Schema.MemberTheme
}

const MemberTransformer = (doc: Schema.Member, params: MemberThemeParams) => {
	doc.theme = params.memberTheme

	return doc
}

export default MemberTransformer
