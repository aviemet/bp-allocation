import React from 'react'

const DisplayHtml = ({ children }: { children: string }) => {
	return (
		<div dangerouslySetInnerHTML={ { __html: children } } />
	)
}

export default DisplayHtml
