import React from "react"

import { observer } from "mobx-react-lite"
import { useSettings } from "/imports/api/providers"

import { PresentationSettingsMethods } from "/imports/api/methods"

import {
	FormControlLabel,
	Switch,
} from "@mui/material"

const TopupsActiveToggle = observer(() => {
	const { settings } = useSettings()

	const saveValue = e => {
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
				index="topupsActive"
				onClick={ saveValue }
				checked={ settings.topupsActive || false }
			/> }
			label="Topups Active"
		/>
	)
})

export default TopupsActiveToggle
