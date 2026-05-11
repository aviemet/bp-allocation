interface DisplayHtmlProps {
	children: string | TrustedHTML
}

export const DisplayHtml = ({ children }: DisplayHtmlProps) => {
	return (
		<div dangerouslySetInnerHTML={ { __html: children } } />
	)
}

