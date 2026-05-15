import { TextField, type TextFieldProps } from "@mui/material"
import { mergeSlotProps } from "@mui/material/utils"
import React, { useEffect, type InputEvent } from "react"
import {
	filterNumericInput,
	shouldBlockBeforeInput,
	toDisplayString,
} from "/imports/lib/forms/numericFieldUtils"
import {
	Controller,
	useFormContext,
	useWatch,
	type FieldPath,
	type FieldValues,
	type RegisterOptions,
} from "react-hook-form"

export interface NumberInputProps<TFieldValues extends FieldValues = FieldValues>
	extends Omit<TextFieldProps, "name" | "onChange" | "type" | "value" | "ref"> {
	ref?: React.Ref<HTMLInputElement>
	name: FieldPath<TFieldValues>
	emptyValue?: number
	integer?: boolean
	onUpdate?: (value: unknown, name: string, form: unknown) => void
	rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>
}

export function NumberInput<TFieldValues extends FieldValues = FieldValues>(
	props: NumberInputProps<TFieldValues>,
) {
	const {
		ref,
		name,
		emptyValue = 0,
		integer = false,
		onUpdate,
		rules,
		...propsRest
	} = props
	const { slotProps, ...textFieldRest } = propsRest
	const form = useFormContext<TFieldValues>()
	const { control, formState: { errors } } = form
	const watched = useWatch({ name })

	useEffect(() => {
		if(!onUpdate) return

		onUpdate(watched, name, form)
	}, [watched, name, form, onUpdate])

	const error = errors[name]
	const errorMessage = error?.message

	return (
		<Controller
			name={ name }
			control={ control }
			rules={ rules }
			render={ ({ field }) => {
				const display = filterNumericInput(toDisplayString(field.value), integer)

				const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
					field.onChange(filterNumericInput(e.target.value, integer))
				}

				const handleBlur = () => {
					field.onBlur()
					const raw = filterNumericInput(toDisplayString(field.value), integer).trim()
					if(raw === "" || raw === ".") {
						field.onChange(String(emptyValue))
						return
					}
					if(!integer && raw.endsWith(".")) {
						const withoutDot = raw.slice(0, -1)
						field.onChange(withoutDot === "" ? String(emptyValue) : withoutDot)
					}
				}

				return (
					<TextField
						{ ...textFieldRest }
						inputRef={ ref }
						fullWidth
						type="text"
						inputMode={ integer ? "numeric" : "decimal" }
						error={ !!error }
						helperText={ errorMessage === undefined ? undefined : String(errorMessage) }
						onChange={ handleChange }
						onBlur={ handleBlur }
						value={ display }
						slotProps={ {
							...slotProps,
							htmlInput: mergeSlotProps(slotProps?.htmlInput, {
								onBeforeInput: (e: InputEvent<HTMLInputElement>) => {
									if(e.defaultPrevented) {
										return
									}
									if(shouldBlockBeforeInput(e, integer)) {
										e.preventDefault()
									}
								},
							}),
						} }
					/>
				)
			} }
		/>
	)
}
