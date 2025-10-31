import styled from "@emotion/styled"
import FormatClearIcon from "@mui/icons-material/FormatClear"
import { Select, MenuItem, IconButton } from "@mui/material"
import { Extension } from "@tiptap/core"
import FontFamily from "@tiptap/extension-font-family"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Strike from "@tiptap/extension-strike"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"
import StarterKit from "@tiptap/starter-kit"
import {
	MenuButtonBold,
	MenuButtonItalic,
	MenuButtonUnderline,
	MenuButtonStrikethrough,
	MenuButtonBlockquote,
	MenuSelectHeading,
	MenuSelectFontFamily,
	MenuSelectTextAlign,
	MenuButtonOrderedList,
	MenuButtonBulletedList,
	MenuButtonIndent,
	MenuButtonUnindent,
	MenuButtonEditLink,
	MenuButtonAddImage,
	MenuControlsContainer,
	MenuDivider,
	RichTextEditor,
	type RichTextEditorRef,
	type FontFamilySelectOption,
} from "mui-tiptap"
import { forwardRef, useEffect, useRef } from "react"

interface TipTapEditorProps {
	value?: string
	onChange?: (content: string) => void
	placeholder?: string
}

const FONT_WHITELIST: FontFamilySelectOption[] = [
	{ label: "Arial", value: "Arial" },
	{ label: "Ubuntu", value: "Ubuntu" },
	{ label: "Raleway", value: "Raleway" },
	{ label: "Roboto", value: "Roboto" },
	{ label: "Courier", value: "Courier" },
	{ label: "Garamond", value: "Garamond" },
	{ label: "Tahoma", value: "Tahoma" },
	{ label: "Times New Roman", value: "Times New Roman" },
	{ label: "Verdana", value: "Verdana" },
]
const SIZE_WHITELIST = ["10px", "14px", "18px", "32px"]

const FontSize = Extension.create({
	name: "fontSize",
	addGlobalAttributes() {
		return [
			{
				types: ["textStyle"],
				attributes: {
					fontSize: {
						default: null,
						parseHTML: element => {
							const fontSize = element.style.fontSize
							if(!fontSize) return null
							return fontSize
						},
						renderHTML: attributes => {
							if(!attributes.fontSize) {
								return {}
							}
							return {
								style: `font-size: ${attributes.fontSize}`,
							}
						},
					},
				},
			},
		]
	},
	addCommands() {
		return {
			setFontSize: fontSize => ({ chain }) => {
				if(!fontSize) {
					return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run()
				}
				return chain().setMark("textStyle", { fontSize }).run()
			},
			unsetFontSize: () => ({ chain }) => {
				return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run()
			},
		}
	},
})

const Editor = forwardRef<RichTextEditorRef, TipTapEditorProps>(({ value, onChange, placeholder }, ref) => {
	const internalRef = useRef<RichTextEditorRef>(null)
	const editorRef = ref || internalRef

	const extensions = [
		StarterKit.configure({
			heading: {
				levels: [1, 2, 3],
			},
		}),
		TextAlign.configure({
			types: ["heading", "paragraph"],
		}),
		FontFamily.configure({
			types: ["textStyle"],
		}),
		TextStyle,
		FontSize,
		Underline,
		Strike,
		Link.configure({
			openOnClick: false,
			HTMLAttributes: {
				class: "link",
			},
		}),
		Image.configure({
			inline: true,
			allowBase64: true,
		}),
		Placeholder.configure({
			placeholder: placeholder || "",
		}),
	]

	useEffect(() => {
		if(!editorRef || typeof editorRef === "function") return
		if(!editorRef.current?.editor) return

		const editor = editorRef.current.editor
		const currentContent = editor.getHTML()

		if(value !== undefined && value !== currentContent) {
			editor.commands.setContent(value || "")
		}
	}, [value, editorRef])

	const handleUpdate = () => {
		if(!editorRef || typeof editorRef === "function") return
		if(!editorRef.current?.editor || !onChange) return

		const html = editorRef.current.editor.getHTML()
		onChange(html)
	}

	return (
		<EditorWrapper>
			<RichTextEditor
				ref={ editorRef }
				extensions={ extensions }
				content={ value || "" }
				onUpdate={ handleUpdate }
				renderControls={ () => {
					if(!editorRef || typeof editorRef === "function" || !editorRef.current?.editor) {
						return null
					}
					const editor = editorRef.current.editor

					const currentFontSize = editor.getAttributes("textStyle").fontSize || ""

					return (
						<MenuControlsContainer>
							<MenuSelectHeading />
							<MenuDivider />
							<MenuSelectFontFamily options={ FONT_WHITELIST } />
							<Select
								value={ SIZE_WHITELIST.includes(currentFontSize) ? currentFontSize : "" }
								onChange={ (e) => {
									const size = e.target.value as string
									if(size) {
										editor.chain().focus().setFontSize(size).run()
									} else {
										editor.chain().focus().unsetFontSize().run()
									}
								} }
								displayEmpty
								size="small"
								sx={ { minWidth: 80, height: 32 } }
							>
								<MenuItem value="">Size</MenuItem>
								{ SIZE_WHITELIST.map(size => (
									<MenuItem key={ size } value={ size }>{ size }</MenuItem>
								)) }
							</Select>
							<MenuDivider />
							<MenuButtonBold />
							<MenuButtonItalic />
							<MenuButtonUnderline />
							<MenuButtonStrikethrough />
							<MenuButtonBlockquote />
							<MenuDivider />
							<MenuSelectTextAlign />
							<MenuDivider />
							<MenuButtonOrderedList />
							<MenuButtonBulletedList />
							<MenuButtonUnindent />
							<MenuButtonIndent />
							<MenuDivider />
							<MenuButtonEditLink />
							<MenuButtonAddImage
								onClick={ () => {
									const url = window.prompt("Enter image URL:")
									if(url && editor) {
										editor.chain().focus().setImage({ src: url }).run()
									}
								} }
							/>
							<MenuDivider />
							<IconButton
								size="small"
								onClick={ () => editor.chain().focus().clearNodes().unsetAllMarks().run() }
								title="Clear formatting"
							>
								<FormatClearIcon />
							</IconButton>
						</MenuControlsContainer>
					)
				} }
				editorProps={ {
					attributes: {
						class: "tip-tap-editor",
					},
				} }
			/>
		</EditorWrapper>
	)
})

Editor.displayName = "TipTapEditor"

const EditorWrapper = styled.div`
	.tip-tap-editor {
		max-width: 600px;
		margin: 0 auto;

		p {
			margin-bottom: 1em;
		}
	}
`

export default Editor
