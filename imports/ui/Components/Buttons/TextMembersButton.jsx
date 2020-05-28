import { Meteor } from 'meteor/meteor'
import React from 'react'
import PropTypes from 'prop-types'

import { useData } from '/imports/api/providers'
import { Button, Icon } from 'semantic-ui-react'
import { observer } from 'mobx-react-lite'

const TextMembersButton = observer(({ message, ...rest }) => {
	const { themeId } = useData()

	const textMembers = () => {
		Meteor.call('textVotingLinkToMembers', { themeId, message })
	}

	return (
		<Button onClick={ textMembers } { ...rest } icon labelPosition='right'>
			<Icon name='text telephone' />
			{ message.title || 'Send Text' }
		</Button>
	)
})

TextMembersButton.propTypes = {
	message: PropTypes.object,
	rest: PropTypes.any
}

export default TextMembersButton