import React from 'react'
import PropTypes from 'prop-types'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const config = {}

/* 
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
config.modules = {
	toolbar: [
		[ 
			{ 'header': '1' }, 
			{ 'header': '2' }, 
			{ 'header': '3' }, 
			{ 'font': [] } 
		],
		[ { size: [] } ],
		['bold', 'italic', 'underline', 'strike', 'blockquote'],
		[ { align: [] } ],
		[ 
			{ 'list': 'ordered' }, 
			{ 'list': 'bullet' }, 
			{ 'indent': '-1' }, 
			{ 'indent': '+1' }
		],
		['link', 'image'],
		['clean']
	],
	clipboard: {
		// toggle to add extra line breaks when pasting HTML:
		matchVisual: false,
	}
}

/* 
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
config.formats = [
	'header', 'font', 'size',
	'bold', 'italic', 'underline', 'strike', 'blockquote',
	'list', 'bullet', 'indent',
	'link', 'image', 'video'
]

/* 
 * Simple editor component that takes placeholder text as a prop 
 */
const Editor = props => {	
	return (
		<div>
			<ReactQuill 
				theme='snow'
				onChange={ props.onChange }
				value={ props.value }
				modules={ config.modules }
				formats={ config.formats }
				bounds={ '.app' }
				placeholder={ props.placeholder || '' }
			/>
		</div>
	)
}

/* 
 * PropType validation
 */
Editor.propTypes = {
	placeholder: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.func
}

export default Editor