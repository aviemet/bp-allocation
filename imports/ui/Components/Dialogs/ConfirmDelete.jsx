import React from 'react'
import PropTypes from 'prop-types'

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material'

const ConfirmationModal = ({ header, content, isModalOpen, handleClose, confirmAction }) => {

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
					color='success'
					onClick={ handleClose }
				>Cancel
				</Button>

				<Button
					color='error'
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

ConfirmationModal.propTypes = {
	header: PropTypes.string,
	content: PropTypes.string,
	isModalOpen: PropTypes.bool,
	handleClose: PropTypes.func,
	confirmAction: PropTypes.func
}

export default ConfirmationModal