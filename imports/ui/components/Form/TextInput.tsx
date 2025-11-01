import { TextField, type TextFieldProps } from "@mui/material"
import React, { useEffect, forwardRef } from "react"
import { Controller, useFormContext, useWatch, type FieldPath, type UseFormReturn, type FieldValues, type RegisterOptions } from "react-hook-form"

interface TextInputProps extends Omit<TextFieldProps, "name" | "onChange"> {
	name: string
	onUpdate?: (value: unknown, name: string, form: UseFormReturn<FieldValues>) => void
	onChange?: (value: string) => string
	rules?: RegisterOptions<FieldValues, FieldPath<FieldValues>>
	pattern?: string
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>((
	{ name, onUpdate, onChange, rules, pattern, ...props },
	ref
) => {
	const form = useFormContext<FieldValues>()
	const { control, formState: { errors } } = form
	const value = useWatch({ name })

	useEffect(() => {
		if(!onUpdate) return

		onUpdate(value, name, form)
	}, [value, name, form, onUpdate])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: { onChange: (value: string) => void }) => {
		if(e.target.value === undefined) return field.onChange("")

		if(!onChange) return field.onChange(e.target.value)

		return field.onChange(onChange(e.target.value))
	}

	const error = errors[name]
	const errorMessage = error?.message

	return (
		<Controller
			name={ name as FieldPath<FieldValues> }
			control={ control }
			rules={ rules }
			render={ ({ field }) => (
				<TextField
					inputRef={ ref }
					fullWidth
					error={ !!error }
					helperText={ errorMessage === undefined ? undefined : String(errorMessage) }
					onChange={ e => handleChange(e, field) }
					value={ field.value || "" }
					{ ...props }
				/>
			) }
		/>
	)
})

TextInput.displayName = "TextInput"

export default TextInput
