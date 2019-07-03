import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'semantic-ui-react';

import { PresentationSettingsContext } from '/imports/context';
import { PresentationSettingsMethods } from '/imports/api/methods';

const PresentationNavButton = props => {

	const { settings } = useContext(PresentationSettingsContext);

	const changeCurrentPage = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				currentPage: props.page
			}
		});
	};

	return (
		<Button icon onClick={ changeCurrentPage }>
			{props.children}
		</Button>
	);
};

PresentationNavButton.propTypes = {
	page: PropTypes.string,
	children: PropTypes.object
};

export default PresentationNavButton;
