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

	const saveValue = async (e: React.ChangeEvent<HTMLInputElement>) => {
		await PresentationSettingsMethods.update.callAsync({
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
