import React from 'react';

import { observer } from 'mobx-react-lite';
import { useSettings } from '/imports/api/providers';

import { PresentationSettingsMethods } from '/imports/api/methods';

import { Checkbox } from 'semantic-ui-react';

const AnimateTopOrgsToggle = observer(() => {
	const { settings } = useSettings();

	const saveValue = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				animateOrgs: data.checked
			}
		});
	};

	return(
		<Checkbox
			label='Animate'
			toggle
			index='animateOrgs'
			onClick={ saveValue }
			checked={ settings.animateOrgs || false }
		/>
	);

});

export default AnimateTopOrgsToggle;
