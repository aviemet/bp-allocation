import { Meteor } from 'meteor/meteor';
import React from 'react';
import _ from 'underscore';

import { withTracker } from 'meteor/react-meteor-data';

import { filterTopOrgs } from '/imports/utils';

import { Themes, Organizations, Images } from '/imports/api';
import { ThemeMethods, OrganizationMethods, ImageMethods } from '/imports/api/methods';

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
		console.log({context: data});
	}

	render() {
		if(this.props.loading){
			return(<Loader/>);
		}

		return (
			<ThemeContext.Provider value={{
				toggleThemeValue: this.toggleThemeValue,
				theme: this.props.theme,
				orgs: this.props.orgs,
				topOrgs: this.props.topOrgs,
				loading: this.props.loading,
			}}>
				{this.props.children}
			</ThemeContext.Provider>
		);
	}
}

const ThemeProvider = withTracker((props) => {
	let id = props.id;

	themesHandle = Meteor.subscribe('themes', id);
	orgsHandle = Meteor.subscribe('organizations', id);
	imagesHandle = Meteor.subscribe('images');

	let theme = Themes.find({_id: id}).fetch()[0];
	let orgs = Organizations.find({theme: id}).fetch();
	let images;

	// Get the image info into the orgs
	let imgIds = orgs.map((org) => ( org.image ));
	if(!_.isEmpty(imgIds)){
		// Fetch the images
		images = Images.find({_id: {$in: imgIds}}).fetch();

		// Map fields from each image object to its respective org
		if(!_.isEmpty(images)){
			orgs.map((org) => {
				image = _.find(images, (img) => ( img._id === org.image));

				imageObj = {}
				if(image){
					imageObj = image;
					imageObj.path = `/uploads/${image._id}.${image.extension}`;
				}
				org.image = imageObj;
			});
		}
	}

	// Pre-filter the top orgs, add to loading condition
	let topOrgs = [];
	let topOrgsReady = false;
	// console.log({themeReady: themesHandle.ready(), orgsReady: orgsHandle.ready(), theme, orgs});
	if(themesHandle.ready() && orgsHandle.ready() && theme && orgs) {
		topOrgs = filterTopOrgs(theme, orgs);
		topOrgsReady = theme.organizations.length > 0 && topOrgs.length <= 0;
	}

	// Calculate the remaining leverage
	let remainingLeverage = 0;
	if(!_.isEmpty(theme) && !_.isEmpty(topOrgs)) {
		let consolation = theme.consolation_active ? (theme.organizations.length - topOrgs.length) * theme.consolation_amount : 0;
		remainingLeverage = theme.leverage_total - theme.leverage_used - consolation;

		topOrgs.map((org) => {
			remainingLeverage -= parseInt(org.amount_from_votes || 0);
			if(org.topoff > 0){
				remainingLeverage -= org.topoff;
			}
		});
		theme.leverage_remaining = parseFloat((remainingLeverage).toFixed(2));
	}

	let loading = !themesHandle.ready() && _.isUndefined(theme) &&
								!orgsHandle.ready() && _.isEmpty(orgs) &&
								!imagesHandle.ready() && _.isUndefined(images) &&
								!topOrgsReady;

	return {
		loading: loading,
		theme: theme,
		orgs: orgs,
		topOrgs: topOrgs
	};
})(ThemeProviderTemplate);

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
