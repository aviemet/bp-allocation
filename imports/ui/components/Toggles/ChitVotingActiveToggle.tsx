import {
	FormControlLabel,
	Switch,
} from "@mui/material"
import React from "react"

import { useSettings } from "/imports/api/hooks"

import { PresentationSettingsMethods } from "/imports/api/methods"


const ChitVotingActiveToggle = () => {
	const { settings } = useSettings()

	if(!settings) return <></>

	const saveValue = async (e: React.ChangeEvent<HTMLInputElement>) => {
		await PresentationSettingsMethods.update.callAsync({
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
				onChange={ saveValue }
				checked={ settings.chitVotingActive || false }
			/> }
			label="Chit Voting Active"
		/>
	)
}

export default ChitVotingActiveToggle
