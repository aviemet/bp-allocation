import {
	FormControlLabel,
	Switch,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import React from "react"
import { useSettings } from "/imports/api/providers"

import { PresentationSettingsMethods } from "/imports/api/methods"


const ShowLeverageToggle = observer(() => {

	const { settings, isLoading: settingsLoading } = useSettings()

	if(!settings) return <></>

	const saveValue = (e: React.ChangeEvent<HTMLInputElement>) => {
		PresentationSettingsMethods.update.call({
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
})

export default ShowLeverageToggle
