import React from 'react';
import PropTypes from 'prop-types';

import { Button } from 'semantic-ui-react';
import styled from 'styled-components';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';
import { PresentationSettingsMethods } from '/imports/api/methods';

const NavButton = styled(Button)`
	width: 100%;
	height: 120px;
	margin-bottom: 10px !important;

	.icon{
		height: unset !important;
	}

	.label {
		font-size: 1.2rem;
	}
`;

const PresentationNavButton = observer(({ page, active, onClick, children, ...rest }) => {
	const { settings } = useData();

	const changeCurrentPage = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				currentPage: page
			}
		});
	};

	// onClick passthrough
	const doOnClick = (e, data) => {
		changeCurrentPage(e, data);
		if(onClick) onClick();
	};

	// Highlight the active page button
	const color = active !== false && settings.currentPage === page ? 'green' : null;

	return (
		<NavButton icon onClick={ doOnClick } color={ color } { ...rest }>
			{ children }
		</NavButton>
	);
});

PresentationNavButton.propTypes = {
	page: PropTypes.string,
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	]),
	onClick: PropTypes.func,
	rest: PropTypes.any
};

export default PresentationNavButton;
