import React from 'react'

import { observer } from 'mobx-react-lite'
import { useSettings } from '/imports/api/providers'

import { PresentationSettingsMethods } from '/imports/api/methods'

import { Checkbox } from 'semantic-ui-react'

const ShowLeverageToggle = observer(() => {

	const { settings, isLoading: settingsLoading } = useSettings()

	const saveValue = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				leverageVisible: data.checked
			}
		})
	}

	const checked = settingsLoading ? false : settings.leverageVisible

	return(
		<Checkbox
			label='Show Leverage'
			toggle
			index='leverageVisible'
			onClick={ saveValue }
			checked={ checked || false }
		/>
	)

})

export default ShowLeverageToggle
