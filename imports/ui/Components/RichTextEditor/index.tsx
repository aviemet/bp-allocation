import React, { useState, forwardRef } from "react"
import PropTypes from "prop-types"
import { Checkbox, FormControlLabel } from "@mui/material"

import RawEditor from "./RawEditor"
import Quill from "./Quill"

const RichTextEditor = forwardRef(({ value, onChange, ...rest }, ref) => {
	const [isRaw, setIsRaw] = useState(false)

	const InputComponent = isRaw ? RawEditor : Quill

	const handleChange = newValue => {
		if(onChange) onChange(newValue)
	}

	return (
		<>
			<FormControlLabel label="Raw HTML" control={
				<Checkbox
					checked={ isRaw }
					onChange={ e => setIsRaw(e.target.checked) } />
			} />
			<InputComponent
				ref={ ref }
				{ ...rest }
				value={ value || "" }
				onChange={ handleChange }
			/>
		</>
	)
})

RichTextEditor.propTypes = {
	placeholder: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.any,
}

export default RichTextEditor
