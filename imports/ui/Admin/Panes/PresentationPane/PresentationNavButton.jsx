import React from 'react';

import { Grid, Button } from 'semantic-ui-react';
import styled from 'styled-components';

import { withContext } from '/imports/api/Context';

import { PresentationSettingsMethods } from '/imports/api/methods';

class PresentationNavButton extends React.Component {
	constructor(props) {
		super(props);
	}

	changeCurrentPage = (e, data) => PresentationSettingsMethods.update.call({
		id: this.props.theme.presentationSettings,
		data: {currentPage: this.props.page
	}});

	render() {
		return (
			<Button icon onClick={this.changeCurrentPage}>
				{this.props.children}
			</Button>
		);
	}
}
export default withContext(PresentationNavButton);
