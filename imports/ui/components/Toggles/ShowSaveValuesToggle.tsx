import {
	FormControlLabel,
	Switch,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { useSettings } from "/imports/api/providers"

import { PresentationSettingsMethods } from "/imports/api/methods"


const ShowSaveValuesToggle = observer(() => {

	const { settings } = useSettings()

	const saveValue = e => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				savesVisible: e.target.checked,
			},
		})
	}

	return (
		<FormControlLabel
			control={ <Switch
				index="savesVisible"
				onClick={ saveValue }
				checked={ settings.savesVisible || false }
			/> }
			label="Show Save Values"
		/>
	)
})

export default ShowSaveValuesToggle
