import { Meteor } from 'meteor/meteor'
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { useTheme } from '/imports/api/providers'
import { observer } from 'mobx-react-lite'

import styled from '@emotion/styled'
import { Paper } from '@mui/material'
import SmsIcon from '@mui/icons-material/Sms'
import EmailIcon from '@mui/icons-material/Email'

import CustomConfirm from '/imports/ui/Components/Dialogs/CustomConfirm'
import { emailVotingLink, textVotingLink } from '/imports/lib/utils'
import { STATUS, SubmitButton } from '/imports/ui/Components/Form'

const buttonValues = {
	email: {
		method: 'emailVotingLinkToMembers',
		icon: EmailIcon
	},
	text: {
		method: 'textVotingLinkToMembers',
		icon: SmsIcon
	}
}

const SendWithFeedbackButton = observer(({ message, members, ...rest }) => {
	const { theme } = useTheme()

	const [buttonStatus, setButtonStatus] = useState(STATUS.READY)
	const [buttonContent, setButtonContent] = useState('Send')
	const [modalOpen, setModalOpen] = useState(false)

	const messageStatus = theme?.messagesStatus?.find(status => status.messageId === message._id)

	let previewMessage = message.body
	if(message.includeLink) {
		if(message.type === 'email') {
			previewMessage += emailVotingLink(theme.slug, 'TEST')
		} else if(message.type === 'text') {
			previewMessage += textVotingLink(theme.slug, 'TEST')
		}
	}

	const handleSendMessage = () => {
		setModalOpen(false)
		Meteor.call(buttonValues[message.type].method, { themeId: theme._id, message, members })
	}

	useEffect(() => {
		if(messageStatus?.error) {
			setButtonStatus(STATUS.ERROR)
			setButtonContent('Error Sending Messages')
		} else if(!messageStatus?.sending && messageStatus?.sent) {
			setButtonContent('Send Again')
		}
	}, [messageStatus])

	let memberCountMessage = 'every member'
	if(Array.isArray(members)) {
		memberCountMessage = `${members.length} member${members.length !== 1 ? 's' : ''}`
	}

	return (
		<>
			<SubmitButton
				onClick={ () => setModalOpen(true) }
				status={ buttonStatus }
				setStatus={ setButtonStatus }
				icon={ buttonValues[message.type].icon }
				{ ...rest }
			>
				{ buttonContent }
			</SubmitButton>

			<CustomConfirm
				header={ `Confirm sending ${message.type}` }
				content={
					<>
						<div>{ `Do you want to send the ${message.type}, "${message.title}" to ${memberCountMessage}?` }</div>
						<div>Preview:</div>
						<Paper elevation={ 1 } sx={ { p: 2 } }>
							<FormattedMessageBody dangerouslySetInnerHTML={ { __html: previewMessage } } />
						</Paper>
					</>
				}
				isModalOpen={ modalOpen }
				handleClose={ () => setModalOpen(false) }
				confirmAction={ handleSendMessage }
				okText="Send The Message"
			/>
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
