import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { withTracker } from 'meteor/react-meteor-data';

import { Themes, PresentationSettings } from '/imports/api';

/**
 * Initialize the Context
 */
const PresentationSettingsContext = React.createContext();

/**
 * Create a Provider with its own API to act as App-wide state store
 */
const PresentationSettingsProviderTemplate = props => {

	return (
		<PresentationSettingsContext.Provider value={ {
			settings: props.presentationSettings,
			settingsLoading: props.loading,
			handles: props.handles
		} }>
			{props.children}
		</PresentationSettingsContext.Provider>
	);
};

PresentationSettingsProviderTemplate.propTypes = {
	presentationSettings: PropTypes.object,
	loading: PropTypes.bool,
	handles: PropTypes.object,
	children: PropTypes.object
};

const PresentationSettingsProvider = withTracker(props => {
	if(!props.id || 
		_.isUndefined(props.handles) || 
		_.isUndefined(props.handles.themes) || 
		_.isUndefined(props.handles.orgs) ||
		_.isUndefined(props.handles.presentationSettings)) {
		return { loading: true };
	}

	const theme = Themes.find({ _id: props.id }).fetch()[0];

	if(_.isUndefined(theme)) return { loading: true };

	const presentationSettings = PresentationSettings.find({ _id: theme.presentationSettings }).fetch()[0];

	const loading = (!props.handles.presentationSettings.ready() || _.isUndefined(theme.presentationSettings));

	return { loading, presentationSettings };
})(PresentationSettingsProviderTemplate);

const usePresentationSettings = () => useContext(PresentationSettingsContext);

export { PresentationSettingsContext, PresentationSettingsProvider, usePresentationSettings };
