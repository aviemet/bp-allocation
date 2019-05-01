import { Meteor } from 'meteor/meteor';
import React from 'react';
import _ from 'lodash';

import { withTracker } from 'meteor/react-meteor-data';

import { filterTopOrgs } from '/imports/utils';

import { Themes, PresentationSettings, Organizations, Images } from '/imports/api';
import { ThemeMethods, PresentationSettingsMethods, OrganizationMethods, ImageMethods } from '/imports/api/methods';

import { Loader } from 'semantic-ui-react'

/**
 * Initialize the Context
 */
const ThemeContext = React.createContext('theme');

/**
 * Create a Provider with its own API to act as App-wide state store
 */
class ThemeProviderTemplate extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<ThemeContext.Provider value={{
				theme: this.props.theme,
			}}>
				{this.props.children}
			</ThemeContext.Provider>
		);
	}
}

const ThemeProvider = withTracker((props) => {
	if(!props.id) return { loading: true };

	// Get the theme
	let themesHandle = Meteor.subscribe('themes', props.id);
	let theme = Themes.find({_id: props.id}).fetch()[0];

	let loading = (!themesHandle.ready() || _.isUndefined(theme));

	return { loading, theme };
})(ThemeProviderTemplate);



export { ThemeContext, ThemeProvider };
