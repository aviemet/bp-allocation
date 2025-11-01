import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material"
import { type ReactNode } from "react"

interface CustomConfirmProps {
	header?: string
	content?: ReactNode
	isModalOpen: boolean
	handleClose: () => void
	confirmAction?: () => void
	cancelAction?: () => void
	okText?: string
	cancelText?: string
	width?: "xs" | "sm" | "md" | "lg" | "xl"
}

const ConfirmationModal = ({ header, content, isModalOpen, handleClose, confirmAction, cancelAction, okText, cancelText, width }: CustomConfirmProps) => {

	return (
		<Dialog
			open={ isModalOpen }
			onClose={ handleClose }
			fullWidth={ true }
			maxWidth={ width || "md" }
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">{ header }</DialogTitle>
			<DialogContent>
				<DialogContentText component={ "div" } id="alert-dialog-description">{ content }
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button color="error" onClick={ () => {
					handleClose()
					if(cancelAction) cancelAction()
				} }>
					{ cancelText || "Cancel" }
				</Button>

				<Button color="success" onClick={ () => {
					handleClose()
					if(confirmAction) confirmAction()
				} }>
					{ okText || "OK" }
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default ConfirmationModal
