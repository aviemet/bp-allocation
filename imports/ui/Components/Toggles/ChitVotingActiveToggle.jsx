import React from 'react';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/api/stores/lib/DataProvider';

import { PresentationSettingsMethods } from '/imports/api/methods';

import { Checkbox } from 'semantic-ui-react';

const ChitVotingActiveToggle = observer(() => {
	const { settings } = useData();

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

});

export default ChitVotingActiveToggle;
