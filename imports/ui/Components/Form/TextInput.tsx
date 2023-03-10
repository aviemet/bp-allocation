import React, { useEffect, forwardRef } from 'react'
import { Controller, type ControllerRenderProps, type FieldValues, useFormContext, useWatch, type UseFormReturn } from 'react-hook-form'
import { TextField, type OutlinedTextFieldProps } from '@mui/material'

interface TextInputProps extends Omit<OutlinedTextFieldProps, 'onChange'|'variant'> {
	name: string
	label?: string
	placeholder?: string
	inputProps?: Record<string, any>
	onUpdate?: (value: string, name: string, form: UseFormReturn<FieldValues, any>) => void
	onChange?: (value: string) => void
	rules?: object
	pattern?: string
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>((
	{ name, inputProps, onUpdate, onChange, rules, pattern, ...props },
	ref,
) => {
	const form = useFormContext()
	const { control, formState: { errors } } = form
	const value = useWatch({ name })

	useEffect(() => {
		if(!onUpdate) return

		onUpdate(value, name, form)
	}, [value])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: ControllerRenderProps<FieldValues, string>) => {
		if(e.target.value === undefined) return field.onChange('')

		if(!onChange) return field.onChange(e.target.value)

		return field.onChange(onChange(e.target.value))
	}

	return (
		<Controller
			name={ name }
			control={ control }
			rules={ rules }
			render={ ({ field }) => (
				<TextField
					{ ...field }
					{ ...props }
					ref={ ref }
					fullWidth
					error={ !!errors[name] }
					helperText={ errors[name]?.message || '' }
					InputProps={ inputProps }
					inputProps={ { pattern } }
					onChange={ e => handleChange(e, field) }
				/>
			) }
		/>
	)
})

export default TextInput
