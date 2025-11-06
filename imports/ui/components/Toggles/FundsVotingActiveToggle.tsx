import {
	FormControlLabel,
	Switch,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import React from "react"
import { useSettings } from "/imports/api/providers"

import { PresentationSettingsMethods } from "/imports/api/methods"


const FundsVotingActiveToggle = observer(() => {

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
})

export default FundsVotingActiveToggle
