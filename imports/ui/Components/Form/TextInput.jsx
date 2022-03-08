import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Controller, useFormContext } from 'react-hook-form'
import { TextField } from '@mui/material'

const TextInput = ({ name, label, inputProps, onUpdate, ...props }) => {
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

	return (
		<Controller
			name={ name }
			control={ control }
			render={ ({ field }) => (
				<TextField
					{ ...field }
					{ ...props }
					label={ label }
					fullWidth
					error={ !!errors[name] }
					helperText={ errors[name] && errors[name].message }
					InputProps={ inputProps }
				/>
			) }
		/>
	)
}

TextInput.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	inputProps: PropTypes.object,
	onUpdate: PropTypes.func,
}

TextInput.defaultProps = {
	inputProps: {}
}

export default TextInput