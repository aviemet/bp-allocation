import { Meteor } from 'meteor/meteor';
import React from 'react';
import _ from 'lodash';

import { withTracker } from 'meteor/react-meteor-data';

import { filterTopOrgs } from '/imports/utils';

import { Themes, PresentationSettings, Organizations, Images } from '/imports/api';
import { ThemeMethods, PresentationSettingsMethods, OrganizationMethods, ImageMethods } from '/imports/api/methods';

/**
 * Initialize the Context
 */
const PresentationSettingsContext = React.createContext('theme');

/**
 * Create a Provider with its own API to act as App-wide state store
 */
class PresentationSettingsProviderTemplate extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<PresentationSettingsContext.Provider value={{
				PresentationSettings: this.props.presentationSettings
			}}>
				{this.props.children}
			</PresentationSettingsContext.Provider>
		);
	}
}

const PresentationSettingsProvider = withTracker((props) => {
	if(!props.id) return { loading: true };

	let themeHandle = Meteor.subscribe('theme', props.id);
	let theme = Themes.find({_id: props.id}).fetch()[0];

	if(_.isUndefined(theme)) return { loading: true };

	let presentationSettingsHandle = Meteor.subscribe('presentationSettings', theme.presentationSettings);
	let presentationSettings = PresentationSettings.find({_id: theme.presentationSettings}).fetch()[0];

	let loading = (!presentationSettingsHandle.ready() || _.isUndefined(theme.presentationSettings));

	return { loading, presentationSettings };
})(PresentationSettingsProviderTemplate);

export { PresentationSettingsContext, PresentationSettingsProvider };
