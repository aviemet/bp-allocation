import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Button, Icon } from 'semantic-ui-react'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { useData } from '/imports/api/providers'
import { uuid } from '/imports/lib/utils'
import TextareaAutosize from 'react-textarea-autosize'
import CKEditor from '/imports/ui/Components/RichTextEditor/CKEditor'

const EditorInput = ({ value, onChange, type, children }) => {
	if(type.toLowerCase() === 'textarea') {
		return (
			<StyledInput>
				<Form style={ { width: '100%' } }>
					<Form.Field
						control={ TextareaAutosize }
						onChange={ e => onChange(e.target.value) }
						useCacheForDOMMeasurements
						value={ value }
					/>
					{ children }
				</Form>
			</StyledInput>
		)
	}

	if(type.toLowerCase() === 'rte') {
		console.log({ onChange })
		return (
			<>
				<CKEditor
					value={ value }
					onChange={ onChange }
				/>
				{ children }
			</>
		)
	}

	return (
		<StyledInput 
			type={ type || 'text' } 
			value={ value }
			onChange={ e => onChange(e.target.value) }
			fluid
			action
		>
			<input />
			{ children }
		</StyledInput>
	)
}

const EditableText = observer(({ as, format, type, onSubmit, children }) => {
	const [ value, setValue ] = useState(children)
	const [ editing, setEditing ] = useState(false)
	const [ id, ] = useState(uuid())

	const data = useData()

	// Register current editor id with global store before activating
	const activateEditor = () => {
		if(editing) return
		data.openEditor = id	
		setEditing(true)
	}

	// Ensure only 1 editor open at a time
	useEffect(() => {
		if(!editing) return
		if(data.openEditor !== id) handleCancel()
	}, [data.openEditor])

	const handleSubmit = () => {
		onSubmit(value)
		setEditing(false)
	}

	const handleCancel = () => {
		setValue(children)
		setEditing(false)
	}

	if(!format) format = value => value

	const Component = as || DisplayDiv

	return (
		<Component onClick={ activateEditor }>
			{ editing ? 
				<EditorInput 
					type={ type || 'text' } 
					value={ value }
					onChange={ data => setValue(data) }
					action
				>
					<Button compact size='mini' onClick={ handleCancel }><Icon name='cancel' color='red' /></Button>
					<Button compact size='mini' onClick={ handleSubmit }><Icon name='checkmark' color='green' /></Button>
				</EditorInput>
				: type === 'rte' ?
					<div dangerouslySetInnerHTML={ { __html: value } } />
					: format(value)
			}
		</Component>
	)
})

const DisplayDiv = styled.div`
	display: inline-block;
`

const StyledInput = styled(Input)`
	width: 100%;
	display: block;

	&.ui.fluid.input > input {
		width: auto !important;
	}
`

EditorInput.propTypes = {
	value: PropTypes.any, 
	onChange: PropTypes.func, 
	type: PropTypes.string, 
	children: PropTypes.any
}

EditableText.propTypes = {
	as: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.node,
		PropTypes.object,
		PropTypes.func,
		PropTypes.string, 
	]),
	format: PropTypes.func,
	type: PropTypes.oneOf(['text', 'textarea', 'rte']),
	children: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
	onSubmit: PropTypes.func.isRequired
}

export default EditableText