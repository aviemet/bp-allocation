import { Checkbox, FormControlLabel } from "@mui/material"
import PropTypes from "prop-types"
import { useState, forwardRef } from "react"

import RawEditor from "./RawEditor"
import TipTapEditor from "./TipTapEditor"

const RichTextEditor = forwardRef(({ value, onChange, ...rest }, ref) => {
	const [isRaw, setIsRaw] = useState(false)

	const InputComponent = isRaw ? RawEditor : TipTapEditor

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
