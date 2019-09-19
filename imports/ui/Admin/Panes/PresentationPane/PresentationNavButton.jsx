import React from 'react';
import PropTypes from 'prop-types';

import { Button } from 'semantic-ui-react';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';
import { PresentationSettingsMethods } from '/imports/api/methods';

const PresentationNavButton = observer(props => {

	const { settings } = useData();

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
});

PresentationNavButton.propTypes = {
	page: PropTypes.string,
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
};

export default PresentationNavButton;
