import React from 'react';

import { observer } from 'mobx-react-lite';
import { useSettings } from '/imports/api/providers';

import { PresentationSettingsMethods } from '/imports/api/methods';

import { Checkbox } from 'semantic-ui-react';

const TopupsActiveToggle = observer(() => {
	const { settings } = useSettings();

	const saveValue = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				topupsActive: data.checked,
				chitVotingActive: false,
				fundsVotingActive: false
			}
		});
	};

	if(!settings.useKioskChitVoting) return <></>;

	return(
		<Checkbox
			label='Topups Active'
			toggle
			index='topupsActive'
			onClick={ saveValue }
			checked={ settings.topupsActive || false }
		/>
	);

});

export default TopupsActiveToggle;
