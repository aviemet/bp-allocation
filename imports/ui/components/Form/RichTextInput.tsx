import { useEffect } from "react"
import { Controller, useFormContext, type FieldValues } from "react-hook-form"
import RichTextEditor from "/imports/ui/components/RichTextEditor"

interface RichTextInputProps {
	name: string
	label?: string
	onUpdate?: (value: unknown, name: string, type?: string) => void
}

const TextInput = ({ name, label: _label, onUpdate }: RichTextInputProps) => {
	const { watch, control } = useFormContext<FieldValues>()

	useEffect(() => {
		if(!onUpdate) return

		const subscription = watch((value, { name: watchName, type }) => {
			if(watchName === name) {
				onUpdate(value, watchName, type)
			}
		})
		return () => subscription.unsubscribe()
	}, [watch, name, onUpdate])

	return (
		<Controller
			name={ name }
			control={ control }
			render={ ({ field }) => <RichTextEditor { ...field } /> }
		/>
	)
}

export default TextInput
