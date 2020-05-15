import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Quill from './Quill';
import RawEditor from './RawEditor';
// import RTE from './RTE';
import { Checkbox } from 'semantic-ui-react';

const RichTextEditor = ({ value, onChange, ...rest }) => {
	const [ isRaw, setIsRaw ] = useState(false);
	const [ content, setContent ] = useState(value || '');

	const InputComponent = isRaw ? RawEditor : Quill;

	const handleChange = newValue => {
		console.log({ newValue });
		setContent(newValue);
		if(onChange) onChange(newValue);
	};

	return (
		<>
			<Checkbox label='Raw Text' checked={ isRaw } onClick={ (e, { checked }) => setIsRaw(checked) } />
			<InputComponent
				value={ content }
				onChange={ handleChange }
			/>
		</>
	);
};

RichTextEditor.propTypes = {
	placeholder: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.any
};

export default RichTextEditor;