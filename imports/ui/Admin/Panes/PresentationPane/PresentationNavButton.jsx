import React, { useContext } from 'react';

import { Grid, Button } from 'semantic-ui-react';
import styled from 'styled-components';

import { PresentationSettingsContext } from '/imports/context';
import { PresentationSettingsMethods } from '/imports/api/methods';

const PresentationNavButton = props => {

	const { settings } = useContext(PresentationSettingsContext)

	const changeCurrentPage = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				currentPage: props.page
			}
		});
	}

	return (
		<Button icon onClick={changeCurrentPage}>
			{props.children}
		</Button>
	);
}

export default PresentationNavButton;
