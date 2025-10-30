import React from "react"
import PropTypes from "prop-types"
import { MessageMethods } from "/imports/api/methods"

import { Switch } from "@mui/material"

const includeVotingLinkToggle = ({ message }) => {
	const saveValue = e => {
		MessageMethods.update.call({
			id: message._id,
			data: {
				active: e.target.checked,
			},
		})
	}

	return (
		<Switch
			onClick={ saveValue }
			checked={ message.active || false }
		/>
	)
}

includeVotingLinkToggle.propTypes = {
	message: PropTypes.object.isRequired,
}

export default includeVotingLinkToggle
