import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Controller, type EventType, useFormContext } from 'react-hook-form'
import RichTextEditor from '/imports/ui/Components/RichTextEditor'

interface ITextInputProps {
	name: string
	label?: string
	onUpdate?: (value: {[x: string]: any}, watchName: string|undefined, type?: EventType) => void
}

const TextInput = ({ name, label, onUpdate }: ITextInputProps) => {
	const { watch, control, formState: { errors } } = useFormContext()

	useEffect(() => {
		if(!onUpdate) return

		const subscription = watch((value, { name: watchName, type }) => {
			if(watchName === name) {
				onUpdate(value, watchName, type)
			}
		})
		return () => subscription.unsubscribe()
	}, [watch])

	return (
		<Controller
			name={ name }
			control={ control }
			render={ ({ field }) => <RichTextEditor { ...field } /> }
		/>
	)
}

TextInput.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	onUpdate: PropTypes.func,
}

export default TextInput
