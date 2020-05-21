import React from 'react'

import { observer } from 'mobx-react-lite'
import { useSettings } from '/imports/api/providers'

import { PresentationSettingsMethods } from '/imports/api/methods'

import { Checkbox } from 'semantic-ui-react'

const ChitVotingActiveToggle = observer(() => {
	const { settings } = useSettings()

	const saveValue = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				chitVotingActive: data.checked,
				fundsVotingActive: false,
				topupsActive: false
			}
		})
	}

	if(!settings.useKioskChitVoting) return <></>

	return(
		<Checkbox
			label='Chit Voting Active'
			toggle
			index='chitVotingActive'
			onClick={ saveValue }
			checked={ settings.chitVotingActive || false }
		/>
	)

})

export default ChitVotingActiveToggle
