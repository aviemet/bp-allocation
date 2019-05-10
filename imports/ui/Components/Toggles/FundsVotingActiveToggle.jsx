import React, { useContext } from 'react';

import { PresentationSettingsContext } from '/imports/context';

import { PresentationSettingsMethods } from '/imports/api/methods';

import { Checkbox } from 'semantic-ui-react';

const FundsVotingActiveToggle = props => {

	const{ settings } = useContext(PresentationSettingsContext);

	const saveValue = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				fundsVotingActive: data.checked
			}
		});
	}

	return(
		<Checkbox
			label='Funds Voting Active'
			toggle
			index='fundsVotingActive'
			onClick={saveValue}
			checked={settings.fundsVotingActive || false}
		/>
	);

}

export default FundsVotingActiveToggle;
