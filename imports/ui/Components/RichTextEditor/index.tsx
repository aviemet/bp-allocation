import React, { useState } from 'react'
import { Checkbox, FormControlLabel } from '@mui/material'
import RawEditor from './RawEditor'
import Quill from './Quill'

interface IRichTextEditorProps {
	placeholder: string
	value: string
	onChange: (value: string) => void
}

const RichTextEditor = ({ value, onChange, ...rest }: IRichTextEditorProps) => {
	const [isRaw, setIsRaw] = useState(false)

	const InputComponent = isRaw ? RawEditor : Quill

	return (
		<>
			<FormControlLabel label='Raw HTML' control={
				<Checkbox
					checked={ isRaw }
					onChange={ e => setIsRaw(e.target.checked) } />
			} />
			<InputComponent
				{ ...rest }
				value={ value || '' }
				onChange={ newValue => { if(onChange) onChange(newValue) } }
			/>
		</>
	)
}

export default RichTextEditor
