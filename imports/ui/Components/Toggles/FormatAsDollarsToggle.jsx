import React, { useContext } from 'react';

import { PresentationSettingsContext } from '/imports/context';

import { PresentationSettingsMethods } from '/imports/api/methods';

import { Checkbox } from 'semantic-ui-react';

const FormatAsDollarsToggle = () => {

	const { settings } = useContext(PresentationSettingsContext);

	const saveValue = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				FormatAsDollars: data.checked
			}
		});
	};

	return(
		<Checkbox
			label='Number Format'
			toggle
			index='FormatAsDollars'
			onClick={ saveValue }
			checked={ settings.FormatAsDollars || false }
		/>
	);

};

export default FormatAsDollarsToggle;
