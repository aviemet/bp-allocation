type MemberThemeParams = {
	memberTheme: MemberTheme
}

const MemberTransformer = (doc: Member, params: MemberThemeParams) => {
	doc.theme = params.memberTheme

	return doc
}

export default MemberTransformer
