import React, { useEffect, forwardRef } from 'react'
import PropTypes from 'prop-types'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { TextField } from '@mui/material'

const TextInput = forwardRef(({ name, inputProps, onUpdate, onChange, rules, pattern, ...props }, ref) => {
	const form = useFormContext()
	const { control, formState: { errors } } = form
	const value = useWatch({ name })

	useEffect(() => {
		if(!onUpdate) return

		onUpdate(value, name, form)
	}, [value])

	const handleChange = (e, field) => {
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
					helperText={ errors[name] && errors[name].message }
					InputProps={ inputProps }
					inputProps={ { pattern } }
					onChange={ e => handleChange(e, field) }
				/>
			) }
		/>
	)
})

TextInput.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	placeholder: PropTypes.string,
	inputProps: PropTypes.object,
	onUpdate: PropTypes.func,
	onChange: PropTypes.func,
	rules: PropTypes.object,
	pattern: PropTypes.string,
}

TextInput.defaultProps = {
	inputProps: {}
}

export default TextInput