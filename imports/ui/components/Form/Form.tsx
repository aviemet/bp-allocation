import { type ReactNode, useEffect, useCallback } from "react"
import {
	useForm,
	FormProvider,
	FieldValues,
	DefaultValues,
	UseFormReturn,
	FieldPath,
	PathValue,
} from "react-hook-form"
import SimpleSchema from "simpl-schema"

interface FormProps<TValues extends FieldValues> {
	children: ReactNode
	schema?: SimpleSchema
	defaultValues?: DefaultValues<TValues>
	onValidSubmit?: (data: TValues, methods: UseFormReturn<TValues>) => void
	onSanitize?: (data: TValues | Partial<TValues>) => TValues | Partial<TValues>
	onValidationError?: (errors: UseFormReturn<TValues>["formState"]["errors"], data: TValues) => void
	onUpdate?: (data: Partial<TValues>) => void
	onChange?: (methods: UseFormReturn<TValues>) => void
}

interface SchemaValidationError {
	name: string
	type: string
}

const Form = <TValues extends FieldValues = FieldValues>({
	children,
	schema,
	defaultValues,
	onValidSubmit,
	onSanitize,
	onValidationError,
	onUpdate,
	onChange,
	...props
}: FormProps<TValues>) => {
	const formValidationContext = schema ? schema.newContext() : null

	const formMethods = useForm<TValues>({ defaultValues })

	const sanitizeSubmit = useCallback((data: TValues) => {
		return onSanitize ? (onSanitize(data) as TValues) : data
	}, [onSanitize])

	const sanitizePartial = useCallback((data: Partial<TValues>) => {
		return onSanitize ? (onSanitize(data) as Partial<TValues>) : data
	}, [onSanitize])

	const onSubmit = (data: TValues) => {
		const sanitizedData = sanitizeSubmit(data)

		if(!formValidationContext || formValidationContext.validate(sanitizedData, { keys: Object.keys(sanitizedData) })) {
			if(onValidSubmit) {
				onValidSubmit(sanitizedData, formMethods)
			}
		} else {
			formValidationContext.validationErrors().forEach((error: SchemaValidationError) => {
				const fieldName = error.name as FieldPath<TValues>
				formMethods.setError(fieldName, {
					type: error.type,
					message: formValidationContext.keyErrorMessage(error.name),
				})
			})
			if(onValidationError) onValidationError(formMethods.formState.errors, sanitizedData)
		}
	}

	useEffect(() => {
		if(!onUpdate) return

		// eslint-disable-next-line react-hooks/incompatible-library
		const subscription = formMethods.watch((values, { name }) => {
			if(name) {
				const fieldName = name as FieldPath<TValues>
				const singleValue: PathValue<TValues, typeof fieldName> = formMethods.getValues(fieldName)
				const valueObject = ({ [fieldName]: singleValue } as unknown) as Partial<TValues>
				const sanitizedData = sanitizePartial(valueObject)
				if(formValidationContext) {
					formValidationContext.validate(sanitizedData, { keys: [name] })
				}
				onUpdate(sanitizedData)
			} else {
				const allValues = formMethods.getValues()
				const sanitizedData = sanitizePartial(allValues as Partial<TValues>)
				onUpdate(sanitizedData)
			}
		})
		return () => subscription.unsubscribe()
	}, [formMethods, onUpdate, sanitizePartial, formValidationContext])

	useEffect(() => {
		if(!onChange) return

		const subscription = formMethods.watch(() => {
			onChange(formMethods)
		})
		return () => subscription.unsubscribe()
	}, [formMethods, onChange])

	return (
		<FormProvider { ...formMethods } { ...props }>
			<form onSubmit={ formMethods.handleSubmit(onSubmit) }>
				{ children }
			</form>
		</FormProvider>
	)
}

export default Form
