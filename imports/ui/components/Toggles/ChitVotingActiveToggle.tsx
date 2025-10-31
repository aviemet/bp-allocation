import {
	FormControlLabel,
	Switch,
} from "@mui/material"
import { observer } from "mobx-react-lite"

import { useSettings } from "/imports/api/providers"

import { PresentationSettingsMethods } from "/imports/api/methods"


const ChitVotingActiveToggle = observer(() => {
	const { settings } = useSettings()

	if(!settings) return <></>

	const saveValue = e => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				chitVotingActive: e.target.checked,
				fundsVotingActive: false,
				topupsActive: false,
			},
		})
	}

	if(!settings.useKioskChitVoting) return <></>

	return (
		<FormControlLabel
			control={ <Switch
				index="chitVotingActive"
				onClick={ saveValue }
				checked={ settings.chitVotingActive || false }
			/> }
			label="Chit Voting Active"
		/>
	)
})

export default ChitVotingActiveToggle
