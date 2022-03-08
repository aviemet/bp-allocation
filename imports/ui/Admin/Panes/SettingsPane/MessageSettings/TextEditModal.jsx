import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Form, Input, TextArea } from 'semantic-ui-react'

import { MessageMethods } from '/imports/api/methods'

const TextEditModal = ({ buttonText, message }) => {
	const [ isModalOpen, setIsModalOpen ] = useState(false)
	const [ messageTitle, setMessageTitle ] = useState((message && message.title) || '')
	const [ messageBody, setMessageBody ] = useState((message && message.body) || '')

	const createNewMessage = e => {
		e.preventDefault()

		MessageMethods.create.call({
			title: messageTitle,
			body: messageBody,
			type: 'text'
		}, (err, res) => {
			if(err) {
				console.error(err)
			} else {
				handleClose()
			}
		})
	}

	const clearInputs = () => {
		setMessageTitle('')
		setMessageBody('')
	}

	const handleClose = () => {
		clearInputs()
		setIsModalOpen(false)
	}

	return (
		<Modal
			trigger={ <Button onClick={ () => setIsModalOpen(true) }>{ buttonText }</Button> }
			centered={ false }
			open={ isModalOpen }
			onClose={ handleClose }
		>
			<Modal.Header>Create New Message</Modal.Header>
			<Modal.Content>
				<Modal.Description>

					<Form onSubmit={ createNewMessage }>

						<Form.Field>
							<label htmlFor="messageTitle">Short but descriptive title for the message</label>
							<Input
								placeholder='e.g. Voting Begins Text'
								id='messageTitle'
								value={ messageTitle }
								onChange={ e => setMessageTitle(e.target.value) }
							/>
						</Form.Field>

						<Form.Field>
							<label htmlFor='messageBody'>Message Body</label>
							<TextArea
								id='messageBody'
								value={ messageBody }
								onChange={ e => setMessageBody(e.target.value) }
							/>
						</Form.Field>

						<div align='right'>
							<Button type='button' onClick={ handleClose } color='red'>Cancel</Button>
							<Button type='submit' color='green'>Save</Button>
						</div>

					</Form>

				</Modal.Description>
			</Modal.Content>
		</Modal>
	)
}

TextEditModal.propTypes = {
	buttonText: PropTypes.string.isRequired,
	message: PropTypes.object
}

export default TextEditModal