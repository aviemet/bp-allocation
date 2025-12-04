import { Controller, useFormContext, useWatch, type FieldValues } from "react-hook-form"
import RichTextEditor from "/imports/ui/components/RichTextEditor"

interface RichTextInputProps {
	name: string
	label?: string
}

const TextInput = ({ name, label: _label }: RichTextInputProps) => {
	const { control } = useFormContext<FieldValues>()

	return (
		<Controller
			name={ name }
			control={ control }
			render={ ({ field }) => <RichTextEditor { ...field } /> }
		/>
	)
}

export default TextInput
