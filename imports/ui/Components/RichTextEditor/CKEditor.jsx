import React from 'react'
import PropTypes from 'prop-types'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

const CK = ({ value, onChange }) => {
	return (
		<CKEditor
			editor={ ClassicEditor }
			data={ value }
			onChange={ ( event, editor ) => {
				const data = editor.getData()
				onChange(data)
			} }
		/>
	)
}

CK.propTypes = {
	value: PropTypes.any,
	onChange: PropTypes.func
}

export default CK
