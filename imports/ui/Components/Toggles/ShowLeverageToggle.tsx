import React from "react"

import { observer } from "mobx-react-lite"
import { useSettings } from "/imports/api/providers"

import { PresentationSettingsMethods } from "/imports/api/methods"

import {
	FormControlLabel,
	Switch,
} from "@mui/material"

const ShowLeverageToggle = observer(() => {

	const { settings, isLoading: settingsLoading } = useSettings()

	const saveValue = e => {
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
				index="leverageVisible"
				onClick={ saveValue }
				checked={ checked || false }
			/>
			}
			label="Show Leverage"
		/>
	)
})

export default ShowLeverageToggle
