import { Meteor } from 'meteor/meteor'
import React from 'react'
import PropTypes from 'prop-types'

import { useTheme } from '/imports/api/providers'
import { Button, Icon } from 'semantic-ui-react'
import { observer } from 'mobx-react-lite'

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
	console.log({ messageStatus: theme.messagesStatus })

	const handleButtonPress = () =>  {
		Meteor.call(buttonValues[message.type], { themeId: theme._id, message })
	}

	const messageStatus = theme.messagesStatus.find(status => status.messageId === message._id)
	let buttonContent = !messageStatus?.sending && messageStatus?.sent ? 'Send Again' : 'Send'

	return (
		<Button onClick={ handleButtonPress } { ...rest } icon labelPosition='right' loading={ !!messageStatus?.sending }>
			<Icon name={ buttonValues[message.type].icon } />
			{ buttonContent }
		</Button>
	)
})

SendWithFeedbackButton.propTypes = {
	message: PropTypes.object.isRequired,
	rest: PropTypes.any
}

export default SendWithFeedbackButton
