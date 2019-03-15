import Meter from 'meteor/meteor';
import React from 'react';

import { ThemeMethods } from '/imports/api/methods';

import { Grid, Header, Segment, Button } from 'semantic-ui-react';

export default class SavedOrg extends React.Component {
	constructor(props) {
		super(props);
	}

	unSaveOrg = () => {
		ThemeMethods.unSaveOrg.call({theme_id: this.props.org.theme, org_id: this.props.org._id});
	}

	render() {
		return(
			<React.Fragment>
				<Grid.Column>
					<Header as="h5">{this.props.org && this.props.org.title}, {this.props.save.amount}</Header>
				</Grid.Column>
				<Grid.Column>
					<Button icon='trash' onClick={this.unSaveOrg} />
				</Grid.Column>
			</React.Fragment>
		);
	}
}
