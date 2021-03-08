import { Meteor } from 'meteor/meteor'
import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { useTheme } from '/imports/api/providers'
import { observer } from 'mobx-react-lite'

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

const SendWithFeedbackButton = observer(({ message, ...rest }) => {
	const { theme } = useTheme()

	const [ modalOpen, setModalOpen ] = useState(false)

	const messageStatus = theme?.messagesStatus?.find(status => status.messageId === message._id)
	let buttonContent = !messageStatus?.sending && messageStatus?.sent ? 'Send Again' : 'Send'

	let previewMessage = message.body
	if(message.includeLink) {
		if(message.type === 'email') {
			previewMessage += emailVotingLink(theme.slug, 'TEST')
		} else if(message.type === 'text') {
			previewMessage += textVotingLink(theme.slug, 'TEST')
		}
	}

	return (
		<>
			<Button
				onClick={ () => setModalOpen(true) }
				icon
				labelPosition='right'
				loading={ messageStatus?.sending }
				color={ !messageStatus?.sending && messageStatus?.sent ? undefined : 'green' }
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
					<p>{ `Do you want to send the ${message.type}, "${message.title}" to every member?` }</p>
					<p>Preview:</p>
					<Segment>
						<div style={ { whiteSpace: 'pre-wrap' } } dangerouslySetInnerHTML={ { __html: previewMessage } } />
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
						onClick={ () => {
							setModalOpen(false)
							Meteor.call(buttonValues[message.type].method, { themeId: theme._id, message })
						} }
					>Send the Message
					</Button>

				</Modal.Actions>
			</Modal>
		</>
	)
})

SendWithFeedbackButton.propTypes = {
	message: PropTypes.object.isRequired,
	rest: PropTypes.any
}

export default SendWithFeedbackButton
