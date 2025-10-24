import React, { forwardRef } from "react"
import PropTypes from "prop-types"
import ReactQuill, { Quill } from "react-quill"
import "react-quill/dist/quill.snow.css"
import styled from "@emotion/styled"


// configure Quill to use inline styles so the email's format properly
var DirectionAttribute = Quill.import("attributors/attribute/direction")
Quill.register(DirectionAttribute, true)

var AlignClass = Quill.import("attributors/class/align")
Quill.register(AlignClass, true)

var BackgroundClass = Quill.import("attributors/class/background")
Quill.register(BackgroundClass, true)

var ColorClass = Quill.import("attributors/class/color")
Quill.register(ColorClass, true)

var DirectionClass = Quill.import("attributors/class/direction")
Quill.register(DirectionClass, true)

var FontClass = Quill.import("attributors/class/font")
Quill.register(FontClass, true)

var SizeClass = Quill.import("attributors/class/size")
Quill.register(SizeClass, true)

var AlignStyle = Quill.import("attributors/style/align")
Quill.register(AlignStyle, true)

var BackgroundStyle = Quill.import("attributors/style/background")
Quill.register(BackgroundStyle, true)

var ColorStyle = Quill.import("attributors/style/color")
Quill.register(ColorStyle, true)

var DirectionStyle = Quill.import("attributors/style/direction")
Quill.register(DirectionStyle, true)

var FontStyle = Quill.import("attributors/style/font")
FontStyle.whitelist = ["Arial", "Ubuntu", "Raleway", "Roboto", "Courier", "Garamond", "Tahoma", "Times New Roman", "Verdana"]
Quill.register(FontStyle, true)

var SizeStyle = Quill.import("attributors/style/size")
SizeStyle.whitelist = ["10px", "14px", "18px", "32px"]
Quill.register(SizeStyle, true)


// const fonts = Quill.import('attributors/style/font')
// fonts.whitelist = ['Arial', 'Ubuntu', 'Raleway', 'Roboto', 'Courier', 'Garamond', 'Tahoma', 'Times New Roman', 'Verdana']
// Quill.register(fonts, true)

/*
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
const config = {
	modules: {
		toolbar: [
			[
				{ "header": "1" },
				{ "header": "2" },
				{ "header": "3" },
				{ "font": FontStyle.whitelist },
			],
			[ { size: SizeStyle.whitelist } ],
			["bold", "italic", "underline", "strike", "blockquote"],
			[ { align: [] } ],
			[
				{ "list": "ordered" },
				{ "list": "bullet" },
				{ "indent": "-1" },
				{ "indent": "+1" },
			],
			["link", "image"],
			["clean"],
		],
		clipboard: {
			// toggle to add extra line breaks when pasting HTML:
			matchVisual: true,
		},
	},

	/*
	* Quill editor formats
	* See https://quilljs.com/docs/formats/
	*/
	formats: [
		"header", "font", "size",
		"bold", "italic", "underline", "strike", "blockquote",
		"align",
		"list", "bullet", "indent",
		"link", "image", "video",
	],
}

/*
 * Simple editor component that takes placeholder text as a prop
 */
const Editor = forwardRef(({ onChange, value, placeholder }, ref) => {
	const handleChange = (content, delta, source, editor) => {
		if(onChange) onChange(content)
	}

	return (
		<QuillWrapper>
			<ReactQuill
				ref={ ref }
				theme="snow"
				onChange={ handleChange }
				value={ value }
				modules={ config.modules }
				formats={ config.formats }
				bounds={ ".app" }
				placeholder={ placeholder || "" }
			/>
		</QuillWrapper>
	)
})

Editor.propTypes = {
	placeholder: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.func,
}

const QuillWrapper = styled.div`
	.ql-picker.ql-font {
    .ql-picker-item {
      font-size: 0;
      &:before {
        content: attr(data-value) !important;
        font-size: 14px;
      }
    }
  }

	.ql-picker.ql-size {
		.ql-picker-item {
			&:before {
				content: attr(data-value) !important;
			}
		}
	}

	.ql-editor {
		max-width: 600px;
		margin: 0 auto;

		p {
			margin-bottom: 1em;
		}
	}
`

export default Editor
