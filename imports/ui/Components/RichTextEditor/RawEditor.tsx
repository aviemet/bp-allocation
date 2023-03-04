import React, { forwardRef } from 'react'
import { Box, TextField } from '@mui/material'
import TextareaAutosize from 'react-textarea-autosize'

interface IRawProps {
	placeholder: string
	value: string
	onChange: (value: string) => void
}

const Raw = forwardRef<typeof TextField, IRawProps>((
	{ value, onChange, ...props }
	, ref,
) => {
	return (
		<Box>
			<TextField
				ref={ ref }
				{ ...props }
				multiline
				fullWidth
				control={ TextareaAutosize }
				onChange={ e => onChange(e.target.value) }
				value={ value }
			/>
		</Box>
	)
})

export default Raw
