import { Switch, FormControlLabel, type SwitchProps } from "@mui/material"
import { useEffect, type ReactElement } from "react"
import { Controller, useFormContext, type UseFormSetValue, type FieldValues } from "react-hook-form"

interface SwitchLabelProps {
	children: ReactElement
	label?: string
}

const SwitchLabel = ({ children, label }: SwitchLabelProps) => {
	return (
		<FormControlLabel control={ children } label={ label } />
	)
}

interface FormSwitchProps extends Omit<SwitchProps, "name"> {
	name: string
	label?: string
	onUpdate?: (value: unknown, name: string, setValue: UseFormSetValue<FieldValues>) => void
}

const FormSwitch = ({ name, label, onUpdate, ...props }: FormSwitchProps) => {
	const { watch, setValue, control } = useFormContext<FieldValues>()

	useEffect(() => {
		if(!onUpdate) return

		const subscription = watch((value, { name: watchName }) => {
			if(watchName === name) {
				onUpdate(value, watchName, setValue)
			}
		})
		return () => subscription.unsubscribe()
	}, [watch, name, onUpdate, setValue])

	const ControlledSwitch = <Controller
		name={ name }
		control={ control }
		render={ ({ field }) => (
			<Switch
				{ ...field }
				{ ...props }
				checked={ Boolean(field.value) }
			/>
		)
		}
	/>


	if(label !== undefined) {
		return <SwitchLabel label={ label }>{ ControlledSwitch }</SwitchLabel>
	}

	return ControlledSwitch
}

export default FormSwitch
