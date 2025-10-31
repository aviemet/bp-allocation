import { forwardRef } from "react"
import PropTypes from "prop-types"

import { Box, TextField } from "@mui/material"
import TextareaAutosize from "react-textarea-autosize"

const Raw = forwardRef(({ value, onChange, ...rest }, ref) => {
	return (
		<Box>
			<TextField
				ref={ ref }
				{ ...rest }
				multiline
				fullWidth
				control={ TextareaAutosize }
				onChange={ e => onChange(e.target.value) }
				value={ value }
			/>
		</Box>
	)
})

Raw.propTypes = {
	placeholder: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.any,
}

export default Raw
