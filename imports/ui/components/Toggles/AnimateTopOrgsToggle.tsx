import {
	FormControlLabel,
	Switch,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import React from "react"
import { useSettings } from "/imports/api/providers"

import { PresentationSettingsMethods } from "/imports/api/methods"


const AnimateTopOrgsToggle = observer(() => {
	const { settings } = useSettings()

	if(!settings) return <></>

	const saveValue = (e: React.ChangeEvent<HTMLInputElement>) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				animateOrgs: e.target.checked,
			},
		})
	}

	return (
		<FormControlLabel
			control={ <Switch
				onChange={ saveValue }
				checked={ settings.animateOrgs || false }
			/> }
			label="Animate"
		/>
	)
})

export default AnimateTopOrgsToggle
