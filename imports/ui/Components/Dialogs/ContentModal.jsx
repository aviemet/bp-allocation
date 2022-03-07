import React from 'react'
import PropTypes from 'prop-types'
import {
	Box,
	Typography,
	Modal,
} from '@mui/material'

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
}

const ContentModal = ({ children, title, open, setOpen }) => {
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

ContentModal.propTypes = {
	children: PropTypes.any,
	title: PropTypes.string,
	open: PropTypes.bool.isRequired,
	setOpen: PropTypes.func.isRequired,
}

export default ContentModal
