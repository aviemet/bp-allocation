import React from 'react';

import { observer } from 'mobx-react-lite';
import { useSettings } from '/imports/api/providers';

import { PresentationSettingsMethods } from '/imports/api/methods';

import { Checkbox } from 'semantic-ui-react';

const ColorizeTopOrgsToggle = observer(() => {
	const { settings } = useSettings();

	const saveValue = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				colorizeOrgs: data.checked
			}
		});
	};

	return(
		<Checkbox
			label='Dim Top Orgs'
			toggle
			index='colorizeOrgs'
			onClick={ saveValue }
			checked={ settings.colorizeOrgs || false }
		/>
	);

});

export default ColorizeTopOrgsToggle;
