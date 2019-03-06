import { Meteor } from 'meteor/meteor';
import React from 'react';
import _ from 'underscore';

import { withTracker } from 'meteor/react-meteor-data';

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

		this.getTopOrgs = this.getTopOrgs.bind(this);
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

	/**
	 *
	 */
	getTopOrgs() {
		return ThemeMethods.filterTopOrgs(this.props.theme, this.props.orgs);
	}

	render() {
		if(this.props.loading){
			return(<Loader/>);
		}
		// console.log({provider: this.props});
		return (
			<ThemeContext.Provider value={{
				toggleThemeValue: this.toggleThemeValue,
				getTopOrgs: this.getTopOrgs,
				theme: this.props.theme,
				orgs: this.props.orgs,
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

	return {
		loading: !themesHandle.ready() && !orgsHandle.ready() && !imagesHandle.ready(),
		theme: theme,
		orgs: orgs
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
