import React from 'react';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

import { PresentationSettingsMethods } from '/imports/api/methods';

import { Checkbox } from 'semantic-ui-react';

const FundsVotingActiveToggle = observer(() => {

	const { settings } = useData();

	const saveValue = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				fundsVotingActive: data.checked,
				chitVotingActive: false
			}
		});
	};

	if(!settings.useKioskFundsVoting) return <></>;

	return(
		<Checkbox
			label='Funds Voting Active'
			toggle
			index='fundsVotingActive'
			onClick={ saveValue }
			checked={ settings.fundsVotingActive || false }
		/>
	);

});

export default FundsVotingActiveToggle;
