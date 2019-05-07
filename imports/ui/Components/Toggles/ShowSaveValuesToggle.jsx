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
				savesVisible: data.checked
			}
		});
	}

	return(
		<Checkbox
			label='Show Save Values'
			toggle
			index='savesVisible'
			onClick={saveValue}
			checked={settings.savesVisible || false}
		/>
	);

}

export default ChitVotingActiveToggle;
