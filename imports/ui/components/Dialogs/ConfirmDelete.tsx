import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material"

interface ConfirmDeleteProps {
	header?: string
	content?: string
	isModalOpen: boolean
	handleClose: () => void
	confirmAction: () => void
}

const ConfirmationModal = ({ header, content, isModalOpen, handleClose, confirmAction }: ConfirmDeleteProps) => {

	return (
		<Dialog
			open={ isModalOpen }
			onClose={ handleClose }
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">{ header }</DialogTitle>
			<DialogContent>
				<DialogContentText id="alert-dialog-description">{ content }
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					color="success"
					onClick={ handleClose }
				>Cancel
				</Button>

				<Button
					color="error"
					onClick={ () => {
						handleClose()
						confirmAction()
					} }
				>Delete!
				</Button>

			</DialogActions>
		</Dialog>
	)
}

export default ConfirmationModal
