const MemberTransformer = (doc, memberTheme) => {
	doc.theme = memberTheme
	
	return doc
}

export default MemberTransformer