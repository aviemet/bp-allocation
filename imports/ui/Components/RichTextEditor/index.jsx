import React, { useState } from 'react';
import PropTypes from 'prop-types';
import RawEditor from './RawEditor';
import Quill from './Quill';
import CKEditor from './CKEditor';
// import RTE from './RTE';
import { Checkbox } from 'semantic-ui-react';

const RichTextEditor = ({ value, onChange, ...rest }, ref) => {
	const [ isRaw, setIsRaw ] = useState(false);
	const [ content, setContent ] = useState(value || '');

	const InputComponent = isRaw ? RawEditor : CKEditor;

	const handleChange = newValue => {
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