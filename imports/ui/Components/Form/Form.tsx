import React, { useEffect } from "react"
import PropTypes from "prop-types"
import { childrenType } from "/imports/types"

import { useForm, FormProvider } from "react-hook-form"
import { debounce } from "lodash"

const Form = ({
	children,
	schema,
	defaultValues = {},
	onValidSubmit,
	onSanitize,
	onValidationError,
	onUpdate,
	onChange,
	...props
}) => {
	const formValidationContext = schema ? schema.newContext() : false

	const formMethods = useForm({ defaultValues })

	const onSubmit = data => {
		const sanitizedData = onSanitize ? onSanitize(data) : data

		if(!formValidationContext || formValidationContext.validate(sanitizedData)) {
			if(onValidSubmit) {
				const debouncedPledgeSubmit = debounce(() => {
					onValidSubmit(sanitizedData, formMethods)
				}, 1000, {
					leading: true,
				})
				debouncedPledgeSubmit()
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
			<form spacing={ 2 } onSubmit={ formMethods.handleSubmit(onSubmit) }>
				{ children }
			</form>
		</FormProvider>
	)
}

Form.propTypes = {
	children: childrenType,
	schema: PropTypes.object,
	defaultValues: PropTypes.object.isRequired,
	onValidSubmit: PropTypes.func,
	onSanitize: PropTypes.func,
	onValidationError: PropTypes.func,
	onUpdate: PropTypes.func,
	onChange: PropTypes.func,
}

export default Form
