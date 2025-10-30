import PropTypes from "prop-types"
import React, { useEffect } from "react"
import { Controller, useFormContext } from "react-hook-form"
import RichTextEditor from "/imports/ui/components/RichTextEditor"

const TextInput = ({ name, label, onUpdate }) => {
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
