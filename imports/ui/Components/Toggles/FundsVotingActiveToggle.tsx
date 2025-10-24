import React from "react"

import { observer } from "mobx-react-lite"
import { useSettings } from "/imports/api/providers"

import { PresentationSettingsMethods } from "/imports/api/methods"

import {
	FormControlLabel,
	Switch,
} from "@mui/material"

const FundsVotingActiveToggle = observer(() => {

	const { settings } = useSettings()

	const saveValue = e => {
		PresentationSettingsMethods.update.call({
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
				index="fundsVotingActive"
				onClick={ saveValue }
				checked={ settings.fundsVotingActive || false }
			/> }
			label="Funds Voting Active"
		/>
	)
})

export default FundsVotingActiveToggle
