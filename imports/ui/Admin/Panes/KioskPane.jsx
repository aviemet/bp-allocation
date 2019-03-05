import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import { Themes } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

import { Loader, Button, Form, Input, Icon } from 'semantic-ui-react';

class SettingsPane extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		}
	}

	render() {
		if(this.props.loading){
			return(<Loader/>)
		}
		return (
			<h1>Kiosk</h1>
		);
	}
}

export default withTracker(({themeId}) => {
	let themesHandle = Meteor.subscribe('themes');

	let theme = Themes.find({_id: themeId}).fetch()[0];

	return {
		theme: theme,
		loading: !themesHandle.ready()
	};
})(SettingsPane);
