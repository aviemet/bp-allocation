import React from 'react';
import PropTypes from 'prop-types';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';
import { ThemeMethods } from '/imports/api/methods';

import { Grid, Header, Button } from 'semantic-ui-react';

const SavedOrg = observer(props => {

	const { theme } = useData();

	const unSaveOrg = () => {
		ThemeMethods.unSaveOrg.call({
			theme_id: theme._id,
			org_id: props.org._id
		});
	};

	return(
		<React.Fragment>
			<Grid.Column>
				<Header as="h5">{props.org && props.org.title}, {props.save.amount}</Header>
			</Grid.Column>
			<Grid.Column>
				<Button icon='trash' onClick={ unSaveOrg } />
			</Grid.Column>
		</React.Fragment>
	);
});

SavedOrg.propTypes = {
	org: PropTypes.object,
	save: PropTypes.object
};

export default SavedOrg;
