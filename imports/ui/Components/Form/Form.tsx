import React, { useEffect } from 'react'
import { useForm, FormProvider,
	type UseFormReturn,
	type DeepPartial,
	type SubmitHandler,
	type PathValue,
	type Path,
	type FieldErrors,
} from 'react-hook-form'
import type SimpleSchema from 'simpl-schema'

interface IFormProps<T extends Record<string, any>> {
	children: React.ReactNode
	schema?: SimpleSchema
	defaultValues: DeepPartial<T>
	onValidSubmit?: (sanitizedData: T, formMethods: UseFormReturn<T>) => void
	onSanitize?: (data: {[x: string]: PathValue<T, Path<T>>}) => T
	onValidationError?: (errors: FieldErrors<T>, data: T) => void
	onUpdate?: (data: {[x: string]: PathValue<T, Path<T>>}) => void
	onChange?: (formMethods: UseFormReturn<T>) => void
}

const Form = <T extends Record<string, any>>({
	children,
	schema,
	defaultValues,
	onValidSubmit,
	onSanitize,
	onValidationError,
	onUpdate,
	onChange,
	...props
}: IFormProps<T>) => {
	const formValidationContext = schema ? schema.newContext() : false
	const formMethods = useForm({ defaultValues })

	const onSubmit: SubmitHandler<T> = (data) => {
		const sanitizedData = onSanitize ? onSanitize(data) : data

		if(formValidationContext === false || formValidationContext.validate(sanitizedData)) {
			if(onValidSubmit) {
				onValidSubmit(sanitizedData, formMethods)
			}
		} else {

			formValidationContext.validationErrors().forEach(error => {
				formMethods.setError(error.name, {
					type: error.type,
					message: formValidationContext.keyErrorMessage(error.name),
				})
			})

			if(onValidationError) onValidationError(formMethods.formState.errors, data)
		}
	}

	useEffect(() => {
		if(!onUpdate) return

		const subscription = formMethods.watch((value, { name, type }) => {
			if(!name) return

			const valueObject = { [name]: formMethods.getValues(name) }
			const sanitizedData = onSanitize ? onSanitize(valueObject) : valueObject
			if(formValidationContext) {
				formValidationContext.validate(sanitizedData, { keys: [name] })
			}

			onUpdate(sanitizedData)
		})
		return () => subscription.unsubscribe()
	}, [formMethods.watch])

	useEffect(() => {
		if(!onChange) return

		const subscription = formMethods.watch(() => {
			onChange(formMethods)
		})
		return () => subscription.unsubscribe()
	}, [formMethods.watch])

	return (
		<FormProvider { ...formMethods } { ...props }>
			<form onSubmit={ formMethods.handleSubmit(onSubmit) }>
				{ children }
			</form>
		</FormProvider>
	)
}

export default Form
