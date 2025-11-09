import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import { Box, Button, LinearProgress, Input } from "@mui/material"
import { useState, useRef, type ChangeEvent } from "react"
import { Images } from "/imports/api/db"

interface UploadInstance {
	on(event: "start", callback: () => void): UploadInstance
	on(event: "progress", callback: (progress: number, fileObj: unknown) => void): UploadInstance
	on(event: "uploaded", callback: (error: unknown, fileObj: unknown) => void): UploadInstance
	on(event: "end", callback: (error: unknown, fileObj: unknown) => void): UploadInstance
	on(event: "error", callback: (error: unknown, fileObj: unknown) => void): UploadInstance
	on(event: string, callback: (...args: unknown[]) => void): UploadInstance
	start: () => void
}

interface FileUploadProps {
	image?: unknown
	width?: number
	fileLocator?: string
	onStart?: () => void
	onProgress?: (data: { progress: number, file: unknown, uploading: UploadInstance | null }) => void
	onUploaded?: (data: { error?: unknown, file: unknown }) => void
	onEnd?: (data: { error?: unknown, file: unknown }) => void
	onError?: (data: { error?: unknown, file: unknown }) => void
}

const FileUpload = ({ width, fileLocator, onStart, onProgress, onUploaded, onEnd, onError }: FileUploadProps) => {
	const [ uploading, setUploading ] = useState<UploadInstance | null>(null)
	const [ progress, setProgress ] = useState(0)
	const [ inProgress, setInProgress ] = useState(false)
	const [ color, setColor ] = useState<"primary" | "success" | "error">("primary")
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault()

		if(e.currentTarget.files && e.currentTarget.files[0]) {
			const file = e.currentTarget.files[0]

			if(file) {
				const uploadInstance = Images.insert({
					file: file,
					meta: {
						locator: fileLocator,
					},
					streams: "dynamic",
					chunkSize: "dynamic",
					allowWebWorkers: true,
				}) as unknown as UploadInstance

				setUploading(uploadInstance)
				setInProgress(true)

				uploadInstance.on("start", () => {
					if(onStart) onStart()
				}).on("progress", (progressValue: number, fileObj: unknown) => {
					if(onProgress) onProgress({ progress: progressValue, file: fileObj, uploading })
					setProgress(progressValue)
				}).on("uploaded", (error: unknown, fileObj: unknown) => {
					if(onUploaded) onUploaded({ error: error, file: fileObj })
					setUploading(null)
					setInProgress(false)
					setColor("success")
				}).on("end", (error: unknown, fileObj: unknown) => {
					if(onEnd) onEnd({ error: error, file: fileObj })
				}).on("error", (error: unknown, fileObj: unknown) => {
					setColor("error")
					setInProgress(false)
					if(onError) onError({ error: error, file: fileObj })
				})

				uploadInstance.start()
			}
		}
	}

	const handleButtonClick = () => {
		fileInputRef.current?.click()
	}

	return (
		<Box sx={ { width: width || "100%", p: 0, m: 0 } }>
			<Input
				type="file"
				inputRef={ fileInputRef }
				onChange={ handleUpload }
				disabled={ inProgress }
				sx={ { display: "none" } }
			/>
			<Button
				variant="contained"
				component="span"
				onClick={ handleButtonClick }
				disabled={ inProgress }
				startIcon={ <CloudUploadIcon /> }
				fullWidth
				sx={ { mb: 1 } }
			>
				{ inProgress ? "Uploading..." : "Choose File" }
			</Button>
			{ inProgress && (
				<LinearProgress
					variant="determinate"
					value={ progress }
					color={ color }
					sx={ { height: 4, borderRadius: 1 } }
				/>
			) }
		</Box>
	)
}

export default FileUpload
