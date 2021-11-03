import { Meteor } from 'meteor/meteor'
import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { useTheme } from '/imports/api/providers'
import { observer } from 'mobx-react-lite'

import styled from 'styled-components'
import { Button, Icon, Modal, Segment } from 'semantic-ui-react'
import { emailVotingLink, textVotingLink } from '/imports/lib/utils'

const buttonValues = {
	email: {
		method: 'emailVotingLinkToMembers',
		icon: 'mail'
	},
	text: {
		method: 'textVotingLinkToMembers',
		icon: 'text telephone'
	}
}

const SendWithFeedbackButton = observer(({ message, members, ...rest }) => {
	const { theme } = useTheme()

	const [modalOpen, setModalOpen] = useState(false)

	const handleSendMessage = () => {
		setModalOpen(false)
		Meteor.call(buttonValues[message.type].method, { themeId: theme._id, message, members })
	}

	const messageStatus = theme?.messagesStatus?.find(status => status.messageId === message._id)
	let buttonContent = 'Send'
	let buttonColor = 'green'
	if(messageStatus?.error) {
		buttonContent = 'Error Sending Messages'
		buttonColor = 'red'
	} else if(!messageStatus?.sending && messageStatus?.sent) {
		buttonContent = 'Send Again'
		buttonColor = undefined
	}

	let previewMessage = message.body
	if(message.includeLink) {
		if(message.type === 'email') {
			previewMessage += emailVotingLink(theme.slug, 'TEST')
		} else if(message.type === 'text') {
			previewMessage += textVotingLink(theme.slug, 'TEST')
		}
	}

	let memberCountMessage = 'every member'
	if(Array.isArray(members)) {
		memberCountMessage = `${members.length} member${members.length !== 1 ? 's' : ''}`
	}

	return (
		<>
			<Button
				onClick={ () => setModalOpen(true) }
				icon
				labelPosition='right'
				loading={ messageStatus?.sending }
				color={ buttonColor }
				{ ...rest }
			>
				<Icon name={ buttonValues[message.type].icon } />
				{ buttonContent }
			</Button>

			<Modal
				centered={ false }
				open={ modalOpen }
				onClose={ () => setModalOpen(false) }
			>
				<Modal.Header>{ `Confirm sending ${message.type}` }</Modal.Header>
				<Modal.Content>
					<p>{ `Do you want to send the ${message.type}, "${message.title}" to ${memberCountMessage}?` }</p>
					<p>Preview:</p>
					<Segment>
						<FormattedMessageBody dangerouslySetInnerHTML={ { __html: previewMessage } } />
					</Segment>

				</Modal.Content>
				<Modal.Actions>
					<Button
						color='red'
						onClick={ () => setModalOpen(false) }
					>Cancel
					</Button>

					<Button
						color='green'
						onClick={ handleSendMessage }
					>Send the Message
					</Button>

				</Modal.Actions>
			</Modal>
		</>
	)
})

const FormattedMessageBody = styled.div`
	white-space: 'pre-wrap';
	
	img { 
		max-width: 100% !important;
		margin: 4px;
		padding: 4px;
		background-color: #FFF;
		border: solid 1px #CCC;
		border-radius: 2px;
	} 
`

SendWithFeedbackButton.propTypes = {
	message: PropTypes.object.isRequired,
	members: PropTypes.array,
	rest: PropTypes.any
}

export default SendWithFeedbackButton
