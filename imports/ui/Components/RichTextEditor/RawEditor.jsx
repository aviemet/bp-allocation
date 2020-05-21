import React from 'react'
import PropTypes from 'prop-types'
// import RTE from './RTE'
import { Form } from 'semantic-ui-react'
import TextareaAutosize from 'react-textarea-autosize'

const Raw = ({ value, onChange, ...rest }) => {
	return (
		<Form>
			<Form.Field
				control={ TextareaAutosize }
				onChange={ e => onChange(e.target.value) }
				useCacheForDOMMeasurements
				value={ value }
				{ ...rest }
			/>
		</Form>
	)
}

Raw.propTypes = {
	placeholder: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.any
}

export default Raw