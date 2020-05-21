import React from 'react';
import PropTypes from 'prop-types';
import CKEditor from '@ckeditor/ckeditor5-react';
// import BalloonEditor from '@ckeditor/ckeditor5-build-balloon';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const CK = ({ value, onChange }) => {
	return (
		<CKEditor
			editor={ ClassicEditor }
			data={ value }
			onInit={ editor => {
				// You can store the "editor" and use when it is needed.
				// console.log( 'Editor is ready to use!', editor );
			} }
			onChange={ ( event, editor ) => {
				const data = editor.getData();
				onChange(data);
			} }
		/>
	);
};

CK.propTypes = {
	value: PropTypes.any,
	onChange: PropTypes.func
};

export default CK;