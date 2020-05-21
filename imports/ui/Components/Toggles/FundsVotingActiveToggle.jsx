import React from 'react'

import { observer } from 'mobx-react-lite'
import { useSettings } from '/imports/api/providers'

import { PresentationSettingsMethods } from '/imports/api/methods'

import { Checkbox } from 'semantic-ui-react'

const FundsVotingActiveToggle = observer(() => {

	const { settings } = useSettings()

	const saveValue = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				fundsVotingActive: data.checked,
				chitVotingActive: false,
				topupsActive: false
			}
		})
	}

	if(!settings.useKioskFundsVoting) return <></>

	return(
		<Checkbox
			label='Funds Voting Active'
			toggle
			index='fundsVotingActive'
			onClick={ saveValue }
			checked={ settings.fundsVotingActive || false }
		/>
	)

})

export default FundsVotingActiveToggle
