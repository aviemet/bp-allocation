import React from 'react';
import PropTypes from 'prop-types';
// import RTE from './RTE';
import { TextArea } from 'semantic-ui-react';

const Raw = ({ value, onChange, ...rest }) => {
	return (
		<TextArea
			value={ value }
			onChange={ e => onChange(e.target.value) }
		/>
	);
};

Raw.propTypes = {
	placeholder: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.any
};

export default Raw;