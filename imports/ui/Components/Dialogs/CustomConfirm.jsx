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

const ConfirmationModal = ({ header, content, isModalOpen, handleClose, confirmAction, cancelAction, okText, cancelText, width }) => {

	return (
		<Dialog
			open={ isModalOpen }
			onClose={ handleClose }
			fullWidth={ true }
			maxWidth={ width || 'md' }
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">{ header }</DialogTitle>
			<DialogContent>
				<DialogContentText component={ 'div' } id="alert-dialog-description">{ content }
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button color='error' onClick={ () => {
					handleClose()
					if(cancelAction) cancelAction()
				} }>
					{ cancelText || 'Cancel'}
				</Button>

				<Button color='success' onClick={ () => {
					handleClose()
					if(confirmAction) confirmAction()
				} }>
					{ okText || 'OK' }
				</Button>
			</DialogActions>
		</Dialog>
	)
}

ConfirmationModal.propTypes = {
	header: PropTypes.string,
	content: PropTypes.node,
	isModalOpen: PropTypes.bool,
	handleClose: PropTypes.func,
	confirmAction: PropTypes.func,
	cancelAction: PropTypes.func,
	okText: PropTypes.string,
	cancelText: PropTypes.string,
	width: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl'])
}

export default ConfirmationModal