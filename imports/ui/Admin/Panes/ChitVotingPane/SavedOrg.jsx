import Meteor from 'meteor/meteor';
import React, { useContext } from 'react';

import { ThemeContext } from '/imports/context';
import { ThemeMethods } from '/imports/api/methods';

import { Grid, Header, Segment, Button } from 'semantic-ui-react';

const SavedOrg = props => {

	const { theme } = useContext(ThemeContext);

	const unSaveOrg = () => {
		ThemeMethods.unSaveOrg.call({
			theme_id: theme._id,
			org_id: props.org._id
		});
	}

	return(
		<React.Fragment>
			<Grid.Column>
				<Header as="h5">{props.org && props.org.title}, {props.save.amount}</Header>
			</Grid.Column>
			<Grid.Column>
				<Button icon='trash' onClick={unSaveOrg} />
			</Grid.Column>
		</React.Fragment>
	);
}

export default SavedOrg;
