import {
	FormControlLabel,
	Switch,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { useSettings } from "/imports/api/providers"

import { PresentationSettingsMethods } from "/imports/api/methods"


const AnimateTopOrgsToggle = observer(() => {
	const { settings } = useSettings()

	const saveValue = e => {
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
				index="animateOrgs"
				onClick={ saveValue }
				checked={ settings.animateOrgs || false }
			/> }
			label="Animate"
		/>
	)
})

export default AnimateTopOrgsToggle
