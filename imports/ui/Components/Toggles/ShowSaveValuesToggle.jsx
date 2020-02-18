import React from 'react';

import { observer } from 'mobx-react-lite';
import { useSettings } from '/imports/api/providers';

import { PresentationSettingsMethods } from '/imports/api/methods';

import { Checkbox } from 'semantic-ui-react';

const ShowSaveValuesToggle = observer(() => {

	const{ settings } = useSettings();

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
