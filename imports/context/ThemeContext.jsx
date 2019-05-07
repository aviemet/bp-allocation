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
				themeLoading: this.props.loading
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

	let orgsHandle = Meteor.subscribe('organizations', props.id);
	let orgs = Organizations.find({theme: props.id}).fetch();

	if(_.isUndefined(theme) || _.isUndefined(orgs)) return { loading: true };

	// Pre-filter the top orgs, add to loading condition
	let topOrgs = [];
	topOrgs = filterTopOrgs(theme, orgs);

	let remainingLeverage = 0;
	if(!_.isEmpty(theme) && !_.isEmpty(topOrgs)) {
		let consolation = theme.consolationActive ? (theme.organizations.length - topOrgs.length) * theme.consolationAmount : 0;
		remainingLeverage = theme.leverageTotal - theme.leverageUsed - consolation;

		topOrgs.map((org) => {
			remainingLeverage -= parseInt(org.amountFromVotes || 0);
			if(org.topOff > 0){
				remainingLeverage -= org.topOff;
			}
		});
		theme.leverageRemaining = parseFloat((remainingLeverage).toFixed(2));
	}

	let loading = (!themesHandle.ready() || _.isUndefined(theme));

	return { loading, theme };
})(ThemeProviderTemplate);



export { ThemeContext, ThemeProvider };
