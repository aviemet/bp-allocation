import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import _ from 'lodash';

import { withTracker } from 'meteor/react-meteor-data';

import { filterTopOrgs } from '/imports/utils';

import { Themes, PresentationSettings, Organizations, Images } from '/imports/api';
import { useTheme } from './ThemeContext';

/**
 * Initialize the Context
 */
const PresentationSettingsContext = React.createContext();

/**
 * Create a Provider with its own API to act as App-wide state store
 */
const PresentationSettingsProviderTemplate = props => {

	return (
		<PresentationSettingsContext.Provider value={{
			settings: props.presentationSettings,
			settingsLoading: props.loading,
			handles: Object.assign({
				settings: props.presentationSettingsHandle
			}, props.handles)
		}}>
			{props.children}
		</PresentationSettingsContext.Provider>
	);
}

const PresentationSettingsProvider = withTracker((props) => {
	if(!props.id || _.isUndefined(props.handles.themes) || _.isUndefined(props.handles.orgs)) return { loading: true };

	let theme = Themes.find({_id: props.id}).fetch()[0];

	if(_.isUndefined(theme)) return { loading: true };

	let presentationSettingsHandle = Meteor.subscribe('presentationSettings', theme.presentationSettings);
	let presentationSettings = PresentationSettings.find({_id: theme.presentationSettings}).fetch()[0];

	let loading = (!presentationSettingsHandle.ready() || _.isUndefined(theme.presentationSettings));

	return { loading, presentationSettings, presentationSettingsHandle };
})(PresentationSettingsProviderTemplate);

const usePresentationSettings = () => useContext(PresentationSettingsContext);

export { PresentationSettingsContext, PresentationSettingsProvider, usePresentationSettings };
