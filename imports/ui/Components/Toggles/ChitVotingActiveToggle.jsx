import React, { useContext } from 'react';

import { PresentationSettingsContext } from '/imports/context';

import { PresentationSettingsMethods } from '/imports/api/methods';

import { Checkbox } from 'semantic-ui-react';

const ChitVotingActiveToggle = () => {

	const{ settings } = useContext(PresentationSettingsContext);

	const saveValue = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				chitVotingActive: data.checked,
				fundsVotingActive: false
			}
		});
	};

	if(!settings.useKioskChitVoting) return <React.Fragment></React.Fragment>;

	return(
		<Checkbox
			label='Chit Voting Active'
			toggle
			index='chitVotingActive'
			onClick={ saveValue }
			checked={ settings.chitVotingActive || false }
		/>
	);

};

export default ChitVotingActiveToggle;
