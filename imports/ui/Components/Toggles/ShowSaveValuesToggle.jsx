import React from 'react';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/api/stores/lib/DataProvider';

import { PresentationSettingsMethods } from '/imports/api/methods';

import { Checkbox } from 'semantic-ui-react';

const ShowSaveValuesToggle = observer(() => {

	const{ settings } = useData();

	const saveValue = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				savesVisible: data.checked
			}
		});
	};

	return(
		<Checkbox
			label='Show Save Values'
			toggle
			index='savesVisible'
			onClick={ saveValue }
			checked={ settings.savesVisible || false }
		/>
	);

});

export default ShowSaveValuesToggle;
