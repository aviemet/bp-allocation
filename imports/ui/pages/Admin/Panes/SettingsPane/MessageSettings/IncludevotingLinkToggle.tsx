import { Checkbox } from "@mui/material"
import React from "react"
import { MessageMethods } from "/imports/api/methods"
import { type MessageData } from "/imports/api/db"

interface IncludeVotingLinkToggleProps {
	message: MessageData
}

const includeVotingLinkToggle = ({ message }: IncludeVotingLinkToggleProps) => {
	const saveValue = async (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
		await MessageMethods.update.callAsync({
			id: message._id,
			data: {
				includeLink: checked,
			},
		})
	}

	return (
		<Checkbox
			onChange={ saveValue }
			checked={ message.includeLink || false }
		/>
	)
}

export default includeVotingLinkToggle
