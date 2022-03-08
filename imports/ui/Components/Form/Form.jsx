import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { childrenType } from '/imports/types'

import { useForm, FormProvider } from 'react-hook-form'

const Form = ({
	children,
	schema,
	defaultValues,
	onValidSubmit,
	onSanitize,
	onValidationError,
	onUpdate,
	...props
}) => {
	const formValidationContext = schema.newContext()

	const formMethods = useForm({ defaultValues })

	const onSubmit = data => {
		const sanitizedData = onSanitize ? onSanitize(data) : data
		console.log({ data })

		if(formValidationContext.validate(sanitizedData)) {
			if(onValidSubmit) {
				onValidSubmit(sanitizedData)
			}
		} else {
			formValidationContext.validationErrors().forEach(error => {
				formMethods.setError(error.name, {
					type: error.type,
					message: formValidationContext.keyErrorMessage(error.name)
				})
			})
			if(onValidationError) onValidationError(formMethods.formState.errors, data)
		}
	}

	useEffect(() => {
		const subscription = formMethods.watch((value, { name, type }) => {
			const sanitizedData = onSanitize ? onSanitize({ [name]: value[name] }) : { [name]: value[name] }
			formValidationContext.validate(sanitizedData, { keys: [name] })

			if(onUpdate !== undefined) {
				onUpdate(sanitizedData)
			}
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
}

Form.defaultProps = {
	defaultValues: {}
}

export default Form
