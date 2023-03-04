import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Controller, useFormContext } from 'react-hook-form'
import { FormControlLabel, Checkbox } from '@mui/material'

interface ICheckboxInputProps {
	name: string
	label: string
	onUpdate?: (value, watchName, setValue) => void
}

const CheckboxInput = ({ name, label, onUpdate }: ICheckboxInputProps) => {
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
		<FormControlLabel
			control={
				<Controller
					control={ control }
					name={ name }
					render={ ({ field }) => (
						<Checkbox
							{ ...field }
							onChange={ e => field.onChange(e.target.checked) }
							checked={ field.value }
						/>
					) }
				/>
			}
			label={ label }
		/>
	)
}

CheckboxInput.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	onUpdate: PropTypes.func,
}

export default CheckboxInput
