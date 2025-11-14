import {
	FormControlLabel,
	Switch,
} from "@mui/material"
import React from "react"
import { useSettings } from "/imports/api/hooks"

import { PresentationSettingsMethods } from "/imports/api/methods"


const FundsVotingActiveToggle = () => {

	const { settings } = useSettings()

	if(!settings) return <></>

	const saveValue = async (e: React.ChangeEvent<HTMLInputElement>) => {
		await PresentationSettingsMethods.update.callAsync({
			id: settings._id,
			data: {
				fundsVotingActive: e.target.checked,
				chitVotingActive: false,
				topupsActive: false,
			},
		})
	}

	if(!settings.useKioskFundsVoting) return <></>

	return (
		<FormControlLabel
			control={ <Switch
				onChange={ saveValue }
				checked={ settings.fundsVotingActive || false }
			/> }
			label="Funds Voting Active"
		/>
	)
}

export default FundsVotingActiveToggle
