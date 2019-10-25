import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, TextArea, Button, Icon } from 'semantic-ui-react';
import styled from 'styled-components';

const StyledInput = styled(Input)`
	width: 100%;
`;


const EditorInput = ({ value, onChange, type, children }) => {

	if(type.toLowerCase() === 'textarea') {
		return (
			<StyledInput>
				<Form style={ { width: '100%' } }>
					<TextArea
						value={ value }
						onChange={ onChange }
					/>
					{ children }
				</Form>
			</StyledInput>
		);
	}

	return (
		<Input 
			type={ type || 'text' } 
			value={ value }
			onChange={ onChange }
			fluid
			action
		>
			<input />
			{ children }
		</Input>
	);
};

const EditableText = ({ as, format, type, onSubmit, children }) => {
	const [ value, setValue ] = useState(children);
	const [ editing, setEditing ] = useState(false);

	const handleSubmit = () => {
		onSubmit(value);
		setEditing(false);
	};

	const handleCancel = () => {
		setValue(children);
		setEditing(false);
	};

	const Component = as || 'div';

	if(editing) {
		return (
			<Component>
				<EditorInput 
					type={ type || 'text' } 
					value={ value }
					onChange={ e => setValue(e.currentTarget.value) }
					action
				>
					<Button compact size='mini' onClick={ handleCancel }><Icon name='cancel' color='red' /></Button>
					<Button compact size='mini' onClick={ handleSubmit }><Icon name='checkmark' color='green' /></Button>
				</EditorInput>
			</Component>
		);
	}

	if(!format) format = value => value;

	return(
		<Component onClick={ () => setEditing(true) }>
			{ format(value) }
		</Component>
	);
};

EditorInput.propTypes = {
	value: PropTypes.any, 
	onChange: PropTypes.func, 
	type: PropTypes.string, 
	children: PropTypes.any
};

EditableText.propTypes = {
	as: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.node,
		PropTypes.object,
		PropTypes.func,
		PropTypes.string, 
	]),
	format: PropTypes.func,
	type: PropTypes.string,
	children: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
	onSubmit: PropTypes.func.isRequired
};

export default EditableText;