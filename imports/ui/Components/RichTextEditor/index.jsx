import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Checkbox } from 'semantic-ui-react'

import RawEditor from './RawEditor'
import Quill from './Quill'
// import CKEditor from './CKEditor'

const RichTextEditor = ({ value, onChange, ...rest }, ref) => {
	const [ isRaw, setIsRaw ] = useState(false)

	const InputComponent = isRaw ? RawEditor : Quill

	const handleChange = newValue => {
		if(onChange) onChange(newValue)
	}

	return (
		<>
			<Checkbox label='Raw HTML' checked={ isRaw } onClick={ (e, { checked }) => setIsRaw(checked) } />
			<InputComponent
				value={ value }
				onChange={ handleChange }
			/>
		</>
	)
}

RichTextEditor.propTypes = {
	placeholder: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.any
}

export default RichTextEditor