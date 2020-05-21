import { Meteor } from 'meteor/meteor'
import React from 'react'
import PropTypes from 'prop-types'

import { useData } from '/imports/api/providers'
import { Button, Icon } from 'semantic-ui-react'
import { observer } from 'mobx-react-lite'

const EmailMembersButton = observer(({ message, ...rest }) => {
	const { themeId } = useData()

	const emailMembers = () => {
		Meteor.call('emailVotingLinkToMembers', { themeId, message })
	}

	return (
		<Button onClick={ emailMembers } { ...rest } icon labelPosition='right'>
			<Icon name='mail' />
			{ message.title || 'Send Email' }
		</Button>
	)
})

EmailMembersButton.propTypes = {
	message: PropTypes.object.isRequired,
	rest: PropTypes.any
}

export default EmailMembersButton