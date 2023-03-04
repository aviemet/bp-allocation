import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Controller, type EventType, useFormContext } from 'react-hook-form'
import { Switch, FormControlLabel, type SwitchProps } from '@mui/material'

interface IFormSwitchProps extends SwitchProps {
	name: string
	label?: string
	onUpdate?: (value: {[x: string]: any}, watchName: string|undefined, type?: EventType) => void
}

const FormSwitch = ({ name, label, onUpdate, ...props }: IFormSwitchProps) => {
	const { watch, setValue, control, formState: { errors } } = useFormContext()

	useEffect(() => {
		if(!onUpdate) return

		const subscription = watch((value, { name: watchName, type }) => {
			if(watchName === name) {
				onUpdate(value, watchName, setValue)
			}
		})
		return () => subscription.unsubscribe()
	}, [watch])

	const ControlledSwitch = <Controller
		name={ name }
		control={ control }
		render={ ({ field }) => (
			<Switch
				{ ...field }
				{ ...props }
				checked={ field.value }
			/>
		)
		}
	/>

	if(label !== undefined) {
		return <FormControlLabel control={ ControlledSwitch } label={ label } />
	}

	return ControlledSwitch
}

export default FormSwitch
