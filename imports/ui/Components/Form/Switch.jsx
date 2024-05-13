import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Controller, useFormContext } from 'react-hook-form'

import { Switch, FormControlLabel } from '@mui/material'

const SwitchLabel = ({ children, label }) => {
	return (
		<FormControlLabel control={ children } label={ label } />
	)
}

SwitchLabel.propTypes = {
	children: PropTypes.any,
	label: PropTypes.string,
}

const FormSwitch = ({ name, label, onUpdate, ...props }) => {
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
		return <SwitchLabel label={ label }>{ ControlledSwitch }</SwitchLabel>
	}

	return ControlledSwitch
}

FormSwitch.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	onUpdate: PropTypes.func,
}

// const SwitchWithOptionalLabel = ({ name, label, onUpdate, ...props }) => {
// 	if(label !== undefined) {
// 		return <SwitchLabel><ControlledSwitch /></SwitchLabel>
// 	}

// 	return <ControlledSwitch />
// }

export default FormSwitch
