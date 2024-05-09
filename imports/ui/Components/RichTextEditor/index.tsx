import React, { forwardRef, useState } from 'react'
import { Checkbox, FormControlLabel } from '@mui/material'
import RawEditor from './RawEditor'
import Quill from './Quill'
import ReactQuill from 'react-quill'
import Tiptap from './TipTap'

interface IRichTextEditorProps {
	placeholder: string
	value: string
	onChange: (value: string) => void
}

const RichTextEditor = forwardRef<ReactQuill, IRichTextEditorProps>((
	{ value, onChange, ...rest },
	ref,
) => {
	const [isRaw, setIsRaw] = useState(false)

	const InputComponent = isRaw ? RawEditor : Tiptap // Quill

	return (
		<>
			<FormControlLabel label='Raw HTML' control={
				<Checkbox
					checked={ isRaw }
					onChange={ e => setIsRaw(e.target.checked) } />
			} />
			<InputComponent
				{ ...rest }
				ref={ ref }
				value={ value || '' }
				onChange={ newValue => { if(onChange) onChange(newValue) } }
			/>
		</>
	)
})

export default RichTextEditor
