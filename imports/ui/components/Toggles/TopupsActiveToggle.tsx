import {
	FormControlLabel,
	Switch,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import React from "react"

import { useSettings } from "/imports/api/providers"

import { PresentationSettingsMethods } from "/imports/api/methods"


const TopupsActiveToggle = observer(() => {
	const { settings } = useSettings()

	if(!settings) return <></>

	const saveValue = (e: React.ChangeEvent<HTMLInputElement>) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				topupsActive: e.target.checked,
				chitVotingActive: false,
				fundsVotingActive: false,
			},
		})
	}

	if(!settings.useKioskChitVoting) return <></>

	return (
		<FormControlLabel
			control={ <Switch
				onChange={ saveValue }
				checked={ settings.topupsActive || false }
			/> }
			label="Topups Active"
		/>
	)
})

export default TopupsActiveToggle
