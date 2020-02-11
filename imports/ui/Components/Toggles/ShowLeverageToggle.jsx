import React from 'react';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/api/stores/lib/DataProvider';

import { PresentationSettingsMethods } from '/imports/api/methods';

import { Checkbox } from 'semantic-ui-react';

const ShowLeverageToggle = observer(() => {

	const { settings } = useData();

	const saveValue = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				leverageVisible: data.checked
			}
		});
	};

	return(
		<Checkbox
			label='Show Leverage'
			toggle
			index='leverageVisible'
			onClick={ saveValue }
			checked={ settings.leverageVisible || false }
		/>
	);

});

export default ShowLeverageToggle;
