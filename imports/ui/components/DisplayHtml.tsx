interface DisplayHtmlProps {
	children: string | TrustedHTML
}

const DisplayHtml = ({ children }: DisplayHtmlProps) => {
	return (
		<div dangerouslySetInnerHTML={ { __html: children } } />
	)
}

export default DisplayHtml
