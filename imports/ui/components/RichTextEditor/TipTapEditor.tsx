import styled from "@emotion/styled"
import FormatClearIcon from "@mui/icons-material/FormatClear"
import { IconButton } from "@mui/material"
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
	MenuSelectFontSize,
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
import { forwardRef, useEffect, useRef, useCallback, type ChangeEvent } from "react"
import { Images } from "/imports/api/db"
import { getImageUrl } from "/imports/lib/utils"

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
const SIZE_WHITELIST = [
	{ label: "10px", value: "10px" },
	{ label: "14px", value: "14px" },
	{ label: "18px", value: "18px" },
	{ label: "32px", value: "32px" },
]

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

const Editor = forwardRef<RichTextEditorRef, TipTapEditorProps>(({ value, onChange, placeholder }, _ref) => {
	const editorRef = useRef<RichTextEditorRef>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

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
		const editorInstance = editorRef.current?.editor
		if(!editorInstance) return

		const currentContent = editorInstance.getHTML()

		if(value !== undefined && value !== currentContent) {
			editorInstance.commands.setContent(value || "")
		}
	}, [value])

	const handleUpdate = () => {
		const editorInstance = editorRef.current?.editor
		if(!editorInstance || !onChange) return

		const html = editorInstance.getHTML()
		onChange(html)
	}

	const handleImageUpload = useCallback(() => {
		fileInputRef.current?.click()
	}, [])

	const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if(!file || !editorRef.current?.editor) {
			return
		}

		try {
			const uploadInstance = Images.insert({
				file: file,
			})

			const insertImage = (fileObj: unknown) => {
				if(!fileObj) {
					return
				}
				const fileData = fileObj as { _id?: string, link?: () => string, _downloadRoute?: string, [key: string]: unknown }

				let imageUrl = ""

				if(fileData.link && typeof fileData.link === "function") {
					try {
						const relativeUrl = fileData.link()
						if(relativeUrl) {
							if(relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
								imageUrl = relativeUrl
							} else {
								const hostUrl = Meteor.settings?.HOST_URL || (typeof window !== "undefined" ? window.location.origin : "")
								imageUrl = hostUrl ? `${hostUrl}${relativeUrl}` : relativeUrl
							}
						}
					} catch (err) {
						console.error("Error calling fileObj.link():", err)
					}
				}

				if(!imageUrl && fileData._id) {
					const fileFromCollection = Images.collection.findOne({ _id: fileData._id })
					if(fileFromCollection &&
						typeof fileFromCollection.name === "string" &&
						typeof fileFromCollection.extension === "string" &&
						typeof fileFromCollection.size === "number" &&
						typeof fileFromCollection.type === "string" &&
						fileFromCollection.link &&
						typeof fileFromCollection.link === "function") {
						imageUrl = getImageUrl(fileFromCollection)
					}

					if(!imageUrl && fileData._id) {
						const downloadRoute = fileData._downloadRoute || "/uploads/"
						const relativeUrl = `${downloadRoute}${fileData._id}`
						const hostUrl = Meteor.settings?.HOST_URL || (typeof window !== "undefined" ? window.location.origin : "")
						imageUrl = hostUrl ? `${hostUrl}${relativeUrl}` : relativeUrl
					}
				}

				if(!imageUrl || !editorRef.current?.editor) {
					return
				}
				const editor = editorRef.current.editor
				editor.chain().focus().insertContent(`<img src="${imageUrl}" alt="" />`).run()
			}

			let uploadCompleted = false

			uploadInstance.on("uploaded", (error, fileObj) => {
				if(!error && fileObj) {
					uploadCompleted = true
					insertImage(fileObj)
				}
			}).on("error", (err) => {
				if(!uploadCompleted && "reason" in err && typeof err.reason === "string" && err.reason !== "Can't start") {
					console.error("Upload error:", err)
				}
			}).on("end", (error, fileObj) => {
				if(!error && fileObj && !uploadCompleted) {
					insertImage(fileObj)
				}
			})

			uploadInstance.start()
		} catch (err) {
			console.error("Error creating upload instance:", err)
		}

		if(e.target) {
			e.target.value = ""
		}
	}, [])

	return (
		<EditorWrapper>
			<RichTextEditor
				ref={ editorRef }
				extensions={ extensions }
				content={ value || "" }
				onUpdate={ handleUpdate }
				renderControls={ () => {
					if(!editorRef.current?.editor) {
						return null
					}

					return (
						<MenuControlsContainer>
							<MenuSelectHeading />
							<MenuDivider />
							<MenuSelectFontFamily options={ FONT_WHITELIST } />
							<MenuSelectFontSize options={ SIZE_WHITELIST } />
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
							<input
								type="file"
								ref={ fileInputRef }
								onChange={ handleFileSelect }
								accept="image/png,image/jpeg,image/jpg,image/gif"
								style={ { display: "none" } }
							/>
							<MenuButtonAddImage
								onClick={ handleImageUpload }
							/>
							<MenuDivider />
							<IconButton
								size="small"
								onClick={ () => editorRef.current?.editor?.chain().focus().clearNodes().unsetAllMarks().run() }
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
