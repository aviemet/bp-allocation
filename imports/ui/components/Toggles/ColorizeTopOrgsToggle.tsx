import {
	FormControlLabel,
	Switch,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { useSettings } from "/imports/api/providers"

import { PresentationSettingsMethods } from "/imports/api/methods"


const ColorizeTopOrgsToggle = observer(() => {
	const { settings } = useSettings()

	const saveValue = e => {
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
				index="colorizeOrgs"
				onClick={ saveValue }
				checked={ settings.colorizeOrgs || false }
			/>
			}
			label="Dim Top Orgs"
		/>
	)
})

export default ColorizeTopOrgsToggle
