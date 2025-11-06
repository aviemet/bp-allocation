import { Checkbox } from "@mui/material"
import { MessageMethods } from "/imports/api/methods"
import { type MessageData } from "/imports/api/db"

interface IncludeVotingLinkToggleProps {
	message: MessageData
}

const includeVotingLinkToggle = ({ message }: IncludeVotingLinkToggleProps) => {
	const saveValue = e => {
		MessageMethods.update.call({
			id: message._id,
			data: {
				includeLink: e.target.checked,
			},
		})
	}

	return (
		<Checkbox
			onClick={ saveValue }
			checked={ message.includeLink || false }
		/>
	)
}

export default includeVotingLinkToggle
