import {
	Box,
	Typography,
	Modal,
} from "@mui/material"
import { type ReactNode } from "react"

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 400,
	bgcolor: "background.paper",
	border: "2px solid #000",
	boxShadow: 24,
	p: 4,
}

interface ContentModalProps {
	children: ReactNode
	title?: string
	open: boolean
	setOpen: (open: boolean) => void
}

const ContentModal = ({ children, title, open, setOpen }: ContentModalProps) => {
	return (
		<Modal
			open={ open }
			onClose={ () => setOpen(false) }
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={ style }>
				{ title && <Typography id="modal-modal-title" variant="h6" component="h2">
					{ title }
				</Typography> }
				<Box id="modal-modal-description" sx={ { mt: 2 } }>
					{ children }
				</Box>
			</Box>
		</Modal>
	)
}

export default ContentModal
