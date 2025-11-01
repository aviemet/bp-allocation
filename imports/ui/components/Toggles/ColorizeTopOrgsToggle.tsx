import {
	FormControlLabel,
	Switch,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import React from "react"
import { useSettings } from "/imports/api/providers"

import { PresentationSettingsMethods } from "/imports/api/methods"


const ColorizeTopOrgsToggle = observer(() => {
	const { settings } = useSettings()

	if(!settings) return <></>

	const saveValue = (e: React.ChangeEvent<HTMLInputElement>) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				colorizeOrgs: e.target.checked,
			},
		})
	}

	return (
		<FormControlLabel
			control={ <Switch
				onChange={ saveValue }
				checked={ settings.colorizeOrgs || false }
			/> }
			label="Dim Top Orgs"
		/>
	)
})

export default ColorizeTopOrgsToggle
