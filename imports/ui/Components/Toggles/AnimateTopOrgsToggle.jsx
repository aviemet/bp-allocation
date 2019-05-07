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
				animateOrgs: data.checked
			}
		});
	}

	return(
		<Checkbox
			label='Animate'
			toggle
			index='animateOrgs'
			onClick={saveValue}
			checked={settings.animateOrgs || false}
		/>
	);

}

export default ChitVotingActiveToggle;
