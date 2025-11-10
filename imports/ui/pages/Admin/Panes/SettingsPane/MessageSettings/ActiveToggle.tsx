import { Switch } from "@mui/material"
import { MessageMethods } from "/imports/api/methods"
import { type MessageData } from "/imports/api/db"
import React from "react"

interface ActiveToggleProps {
	message: MessageData
}

const includeVotingLinkToggle = ({ message }: ActiveToggleProps) => {
	const saveValue = async (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
		await MessageMethods.update.callAsync({
			id: message._id,
			data: {
				active: checked,
			},
		})
	}

	return (
		<Switch
			onChange={ saveValue }
			checked={ message.active || false }
		/>
	)
}

export default includeVotingLinkToggle
