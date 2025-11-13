import {
	FormControlLabel,
	Switch,
} from "@mui/material"
import React from "react"
import { useSettings } from "/imports/api/hooks"

import { PresentationSettingsMethods } from "/imports/api/methods"


const ShowLeverageToggle = () => {

	const { settings, settingsLoading } = useSettings()

	if(!settings) return <></>

	const saveValue = async (e: React.ChangeEvent<HTMLInputElement>) => {
		await PresentationSettingsMethods.update.callAsync({
			id: settings._id,
			data: {
				leverageVisible: e.target.checked,
			},
		})
	}

	const checked = settingsLoading ? false : settings.leverageVisible

	return (
		<FormControlLabel
			control={ <Switch
				onChange={ saveValue }
				checked={ checked || false }
			/> }
			label="Show Leverage"
		/>
	)
}

export default ShowLeverageToggle
