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
				colorizeOrgs: data.checked
			}
		});
	}

	return(
		<Checkbox
			label='Colorize Top Orgs'
			toggle
			index='colorizeOrgs'
			onClick={saveValue}
			checked={settings.colorizeOrgs || false}
		/>
	);

}

export default ChitVotingActiveToggle;
