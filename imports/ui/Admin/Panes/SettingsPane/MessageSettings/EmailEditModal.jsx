import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Form, Input } from 'semantic-ui-react'

import { MessageMethods } from '/imports/api/methods'
import RichTextEditor from '/imports/ui/Components/RichTextEditor'

const EmailEditModal = ({ buttonText, message }) => {
	const [ isModalOpen, setIsModalOpen ] = useState(false)
	const [ messageTitle, setMessageTitle ] = useState((message && message.title) || '')
	const [ messageSubject, setMessageSubject ] = useState((message && message.subject) || '')
	const [ messageBody, setMessageBody ] = useState((message && message.body) || '')

	const createNewMessage = e => {
		e.preventDefault()

		MessageMethods.create.call({
			title: messageTitle,
			subject: messageSubject,
			body: messageBody,
			type: 'email'
		}, (err, res) => {
			if(err) {
				console.error(err)
			} else {
				setIsModalOpen(false)
			}
		})
	}

	// Sanitize and escape content for saving in DB
	const handleRichContentChange = content => {
		setMessageBody(content)
	}

	const handleClose = () => {
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
							<label htmlFor='messageSubject'>Subject</label>
							<Input
								id='messageSubject'
								value={ messageSubject }
								onChange={ e => setMessageSubject(e.target.value) }
							/>
						</Form.Field>

						<Form.Field>
							<label htmlFor='messageBody'>Message Body</label>
							<RichTextEditor
								id='messageBody'
								value={ messageBody }
								onChange={ handleRichContentChange }
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

EmailEditModal.propTypes = {
	buttonText: PropTypes.string.isRequired,
	message: PropTypes.object
}

export default EmailEditModal