import React, { useContext } from 'react';

import { PresentationSettingsContext } from '/imports/context';

import { PresentationSettingsMethods } from '/imports/api/methods';

import { Checkbox } from 'semantic-ui-react';

const ChitVotingActiveToggle = props => {

	const{ settings } = useContext(PresentationSettingsContext);

	const saveValue = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				leverageVisible: data.checked
			}
		});
	}

	return(
		<Checkbox
			label='Show Leverage'
			toggle
			index='leverageVisible'
			onClick={saveValue}
			checked={settings.leverageVisible || false}
		/>
	);

}

export default ChitVotingActiveToggle;
