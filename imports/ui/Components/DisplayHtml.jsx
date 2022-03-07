import React from 'react'
import PropTypes from 'prop-types'

const DisplayHtml = ({ children }) => {
	return (
		<div dangerouslySetInnerHTML={ { __html: children } } />
	)
}

DisplayHtml.propTypes = {
	children: PropTypes.string
}

export default DisplayHtml
