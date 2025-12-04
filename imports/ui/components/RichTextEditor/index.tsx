import { Checkbox, FormControlLabel } from "@mui/material"
import { type RichTextEditorRef } from "mui-tiptap"
import { Activity } from "react"
import { useState, forwardRef } from "react"

import RawEditor from "./RawEditor"
import TipTapEditor from "./TipTapEditor"

interface RichTextEditorProps {
	placeholder?: string
	value?: string
	onChange?: (value: string) => void
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({ value, onChange, placeholder }, ref) => {
	const [isRaw, setIsRaw] = useState(false)

	const handleChange = (newValue: string) => {
		if(onChange) onChange(newValue)
	}

	return (
		<>
			<FormControlLabel label="Raw HTML" control={
				<Checkbox
					checked={ isRaw }
					onChange={ e => setIsRaw(e.target.checked) } />
			} />
			<Activity mode={ isRaw ? "visible" : "hidden" }>
				<RawEditor
					value={ value || "" }
					onChange={ handleChange }
					placeholder={ placeholder }
				/>
			</Activity>
			<Activity mode={ isRaw ? "hidden" : "visible" }>
				<TipTapEditor
					ref={ ref }
					value={ value || "" }
					onChange={ handleChange }
					placeholder={ placeholder }
				/>
			</Activity>
		</>
	)
})

RichTextEditor.displayName = "RichTextEditor"

export default RichTextEditor
