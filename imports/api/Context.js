import { Meteor } from 'meteor/meteor';
import React from 'react';
import _ from 'lodash';

import { withTracker } from 'meteor/react-meteor-data';

import { filterTopOrgs } from '/imports/utils';

import { Themes, PresentationSettings, Organizations, Images } from '/imports/api';
import { ThemeMethods, PresentationSettingsMethods, OrganizationMethods, ImageMethods } from '/imports/api/methods';

import { Loader } from 'semantic-ui-react'

import { DEBUG } from '/imports/debug';

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

		this.state = {
			themeId: this.props.id
		}
	}

	componentDidMount() {
		if(this.props.loading) return;
	}

	/**
	 * Togle boolean values on the Theme model
	 */
	toggleThemeValue(e, data){
		let tempData = {};
		tempData[data.index] = data.checked;

		// ThemeMethods.update.call({id: this.props.themeId, data: tempData});
		// console.log({context: data});
	}

	render() {
		return (
			<ThemeContext.Provider value={{
				toggleThemeValue: this.toggleThemeValue,
				theme: this.props.theme,
				presentationSettings: this.props.presentationSettings,
				orgs: this.props.orgs,
				topOrgs: this.props.topOrgs,
				images: this.props.images,
				loading: this.props.loading,
			}}>
				{this.props.children}
			</ThemeContext.Provider>
		);
	}
}

const ThemeProvider = withTracker((props) => {
	if(!props.id) return { loading: true };

	let id = props.id;

	// Get the theme
	let themesHandle = Meteor.subscribe('themes', id);
	let theme = Themes.find({_id: id}).fetch()[0];

	// Get the Organizations in the theme
	let orgsHandle = Meteor.subscribe('organizations', id);
	let orgs = Organizations.find({theme: id}).fetch();

	// Escape out if the theme or orgs haven't loaded yet
	if(!themesHandle.ready() || !orgsHandle.ready() || !theme || !orgs) return { loading: true };

	// Get the presentation settings for the theme
	let presentationSettingsHandle = Meteor.subscribe('presentationSettings', theme.presentationSettings);
	let presentationSettings = PresentationSettings.find({_id: theme.presentationSettings}).fetch()[0];

	// Begin getting the images
	// let imagesHandle = Meteor.subscribe('images.byTheme', id);
	let images = [];

	let imgIds = orgs.map((org) => ( org.image ));
	let imagesHandle = Meteor.subscribe('images', imgIds);

	if(!_.isEmpty(imgIds)){
		// Fetch the images
		images = Images.find({_id: {$in: imgIds}}).fetch();
	}

	// Pre-filter the top orgs, add to loading condition
	let topOrgs = [];
	topOrgs = filterTopOrgs(theme, orgs);

	// Calculate the remaining leverage
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

	let loading = (!themesHandle.ready() || _.isUndefined(theme)) ||
                (!presentationSettingsHandle.ready() || _.isUndefined(theme.presentationSettings)) ||
                (!orgsHandle.ready() || _.isUndefined(orgs)) ||
                (!imagesHandle.ready());

	return { loading, theme, orgs, topOrgs, images, presentationSettings };
})(ThemeProviderTemplate);


/**
 * HOC to also provide the same context
 */
const withContext = (ComposedComponent) => {
	class ContextComponent extends React.Component {
		constructor(props) {
			super(props)
		}

		render() {
			return(
				<ThemeContext.Consumer>{ theme => (
					<ComposedComponent {...this.props} {...theme} />
				)}</ThemeContext.Consumer>
			);
		}
	}
	return ContextComponent;
}


export { ThemeContext, ThemeProvider, withContext };
