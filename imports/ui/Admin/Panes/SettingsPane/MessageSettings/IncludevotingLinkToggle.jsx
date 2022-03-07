import React from 'react'
import PropTypes from 'prop-types'
import { MessageMethods } from '/imports/api/methods'

import { Checkbox } from '@mui/material'

const includeVotingLinkToggle = ({ message }) => {
	const saveValue = e => {
		MessageMethods.update.call({
			id: message._id,
			data: {
				includeLink: e.target.checked
			}
		})
	}

	return(
		<Checkbox
			onClick={ saveValue }
			checked={ message.includeLink || false }
		/>
	)
}

includeVotingLinkToggle.propTypes = {
	message: PropTypes.object.isRequired
}

export default includeVotingLinkToggle