import React from 'react';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

import { PresentationSettingsMethods } from '/imports/api/methods';

import { Checkbox } from 'semantic-ui-react';

const AnimateTopOrgsToggle = observer(() => {
	const { settings } = useData();

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
