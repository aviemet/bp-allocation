import {
	FormControlLabel,
	Switch,
} from "@mui/material"
import React from "react"
import { useSettings } from "/imports/api/hooks"

import { PresentationSettingsMethods } from "/imports/api/methods"


const ShowSaveValuesToggle = () => {

	const { settings } = useSettings()

	if(!settings) return <></>

	const saveValue = async (e: React.ChangeEvent<HTMLInputElement>) => {
		await PresentationSettingsMethods.update.callAsync({
			id: settings._id,
			data: {
				savesVisible: e.target.checked,
			},
		})
	}

	return (
		<FormControlLabel
			control={ <Switch
				onChange={ saveValue }
				checked={ settings.savesVisible || false }
			/> }
			label="Show Save Values"
		/>
	)
}

export default ShowSaveValuesToggle
