import React from 'react'
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material'

interface IConfirmationModalProps {
	header: string
	content: string
	isModalOpen: boolean
	handleClose: () => void
	confirmAction?: () => void
}

const ConfirmationModal = ({
	header,
	content,
	isModalOpen,
	handleClose,
	confirmAction,
}: IConfirmationModalProps) => {

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
					onClick={ () => {
						handleClose()
						if(confirmAction) confirmAction()
					} }
				>Ok
				</Button>

			</DialogActions>
		</Dialog>
	)
}

export default ConfirmationModal
