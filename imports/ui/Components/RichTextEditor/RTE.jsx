import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import RichTextEditor from 'react-rte'

const toolbarConfig = {

	// Optionally specify the groups to display (displayed in the order listed).
	display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'LINK_BUTTONS', 'BLOCK_TYPE_DROPDOWN', 'HISTORY_BUTTONS'],
	INLINE_STYLE_BUTTONS: [
		{ label: 'Bold', style: 'BOLD', className: 'custom-css-class' },
		{ label: 'Italic', style: 'ITALIC' },
		{ label: 'Underline', style: 'UNDERLINE' }
	],
	BLOCK_TYPE_DROPDOWN: [
		{ label: 'Normal', style: 'unstyled' },
		{ label: 'Heading Large', style: 'header-one' },
		{ label: 'Heading Medium', style: 'header-two' },
		{ label: 'Heading Small', style: 'header-three' }
	],
	BLOCK_TYPE_BUTTONS: [
		{ label: 'UL', style: 'unordered-list-item' },
		{ label: 'OL', style: 'ordered-list-item' }
	]
}

const RTE = ({ value, onChange }) => {
	const [ initialized, setInitialized ] = useState(false)

	useEffect(() => {
		onChange(value ? 
			RichTextEditor.createValueFromString(value) : 
			RichTextEditor.createEmptyValue()
		)
		setInitialized(true)
	}, [])

	return (
		<RichTextEditor
			value={ initialized ? value : RichTextEditor.createEmptyValue }
			onChange={ onChange }
			toolbarConfig={ toolbarConfig }
		/>
	)
}

RTE.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func
}

export default RTE