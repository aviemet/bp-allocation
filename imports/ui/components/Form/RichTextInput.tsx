import { Controller, useFormContext, type FieldValues } from "react-hook-form"
import { RichTextEditor } from "/imports/ui/components/RichTextEditor"

interface RichTextInputProps {
	name: string
	label?: string
}

export const RichTextInput = ({ name, label: _label }: RichTextInputProps) => {
	const { control } = useFormContext<FieldValues>()

	return (
		<Controller
			name={ name }
			control={ control }
			render={ ({ field }) => <RichTextEditor { ...field } /> }
		/>
	)
}

