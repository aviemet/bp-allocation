import { Box, TextField, type TextFieldProps } from "@mui/material"
import { forwardRef } from "react"
import TextareaAutosize from "react-textarea-autosize"

interface RawEditorProps extends Omit<TextFieldProps, "value" | "onChange" | "multiline"> {
	value?: string
	onChange?: (value: string) => void
}

const Raw = forwardRef<HTMLInputElement, RawEditorProps>(({ value, onChange, ...rest }, ref) => {
	return (
		<Box>
			<TextField
				ref={ ref }
				{ ...rest }
				multiline
				fullWidth
				slotProps={ {
					htmlInput: {
						component: TextareaAutosize,
						style: { resize: "vertical" },
					},
				} }
				onChange={ e => {
					if(onChange) onChange(e.target.value)
				} }
				value={ value || "" }
			/>
		</Box>
	)
})

Raw.displayName = "RawEditor"

export default Raw
