import { Switch } from "@mui/material"
import { MessageMethods } from "/imports/api/methods"
import { type MessageData } from "/imports/api/db"

interface ActiveToggleProps {
	message: MessageData
}

const includeVotingLinkToggle = ({ message }: ActiveToggleProps) => {
	const saveValue = async e => {
		await MessageMethods.update.callAsync({
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

export default includeVotingLinkToggle
