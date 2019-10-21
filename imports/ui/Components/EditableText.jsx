import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Icon } from 'semantic-ui-react';

const EditableText = ({ as, inputType, onSubmit, children }) => {
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
				<Input 
					type={ inputType || 'text' } 
					value={ value }
					onChange={ e => setValue(e.currentTarget.value) }
					action
				>
					<input />
					<Button compact size='mini' onClick={ handleCancel }><Icon name='cancel' color='red' /></Button>
					<Button compact size='mini' onClick={ handleSubmit }><Icon name='checkmark' color='green' /></Button>
				</Input>
			</Component>
		);
	}

	return(
		<Component onClick={ () => setEditing(true) }>
			{ value }
		</Component>
	);
};

EditableText.propTypes = {
	as: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.node,
		PropTypes.object,
		PropTypes.func,
		PropTypes.string, 
	]),
	inputType: PropTypes.string,
	children: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
	onSubmit: PropTypes.func.isRequired
};

export default EditableText;