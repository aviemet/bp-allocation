import { FormControlLabel, Switch } from "@mui/material"
import { useEffect } from "react"
import { Controller, useFormContext, type UseFormSetValue, type FieldValues } from "react-hook-form"

interface SwitchInputProps {
	name: string
	label: string
	onUpdate?: (value: unknown, name: string, setValue: UseFormSetValue<FieldValues>) => void
}

const CheckboxInput = ({ name, label, onUpdate }: SwitchInputProps) => {
	const { watch, setValue, control } = useFormContext<FieldValues>()

	useEffect(() => {
		if(!onUpdate) return

		const subscription = watch((value, { name: watchName }) => {
			if(watchName === name) {
				onUpdate(value, watchName, setValue)
			}
		})
		return () => subscription.unsubscribe()
	}, [name, onUpdate, setValue, watch])

	return (
		<FormControlLabel
			control={
				<Controller
					control={ control }
					name={ name }
					render={ ({ field }) => (
						<Switch
							{ ...field }
							onChange={ e => field.onChange(e.target.checked) }
							checked={ Boolean(field.value) }
						/>
					) }
				/>
			}
			label={ label }
		/>
	)
}

export default CheckboxInput
