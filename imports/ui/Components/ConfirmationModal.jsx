import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

import { Button, Modal } from 'semantic-ui-react';
import usePortal from '../../lib/usePortal';

const ConfirmationModal = ({ header, content, isModalOpen, handleClose, confirmAction }) => {
	const target = usePortal('modal');

	return createPortal(
		<Modal 
			centered={ false }
			open={ isModalOpen }
			onClose={ handleClose }
		>
			<Modal.Header>{ header }</Modal.Header>
			<Modal.Content>{ content }</Modal.Content>
			<Modal.Actions>
				<Button 
					color='green' 
					onClick={ handleClose }
				>Cancel
				</Button>

				<Button 
					color='red' 
					onClick={ () => {
						handleClose();
						confirmAction();
					} }
				>Delete!
				</Button>

			</Modal.Actions>
		</Modal>,
		target
	);			
};

ConfirmationModal.propTypes = { 
	header: PropTypes.string, 
	content: PropTypes.string, 
	isModalOpen: PropTypes.bool, 
	handleClose: PropTypes.func, 
	confirmAction: PropTypes.func
};

export default ConfirmationModal;