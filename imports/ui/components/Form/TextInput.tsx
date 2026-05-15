import { TextField, type TextFieldProps } from "@mui/material"
import React, { useEffect } from "react"
import {
	Controller,
	useFormContext,
	useWatch,
	type FieldPath,
	type FieldValues,
	type RegisterOptions,
} from "react-hook-form"

export interface TextInputProps<TFieldValues extends FieldValues = FieldValues>
	extends Omit<TextFieldProps, "name" | "onChange" | "ref"> {
	ref?: React.Ref<HTMLInputElement>
	name: FieldPath<TFieldValues>
	onUpdate?: (value: unknown, name: string, form: unknown) => void
	onChange?: (value: string) => string
	rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>
	pattern?: string
}

export function TextInput<TFieldValues extends FieldValues = FieldValues>(
	{ ref, name, onUpdate, onChange, rules, ...props }: TextInputProps<TFieldValues>,
) {
	const form = useFormContext<TFieldValues>()
	const { control, formState: { errors } } = form
	const value = useWatch({ name })

	useEffect(() => {
		if(!onUpdate) return

		onUpdate(value, name, form)
	}, [value, name, form, onUpdate])

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		field: { onChange: (value: string) => void },
	) => {
		if(e.target.value === undefined) return field.onChange("")

		if(!onChange) return field.onChange(e.target.value)

		return field.onChange(onChange(e.target.value))
	}

	const error = errors[name]
	const errorMessage = error?.message

	return (
		<Controller
			name={ name }
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
}
