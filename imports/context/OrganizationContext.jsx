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
const OrganizationContext = React.createContext('theme');

/**
 * Create a Provider with its own API to act as App-wide state store
 */
class OrganizationProviderTemplate extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<OrganizationContext.Provider value={{
				orgs: this.props.orgs,
				topOrgs: this.props.topOrgs
			}}>
				{this.props.children}
			</OrganizationContext.Provider>
		);
	}
}

const OrganizationProvider = withTracker((props) => {
	if(!props.id) return { loading: true };

	let themeHandle = Meteor.subscribe('theme', props.id);
	let theme = Themes.find({_id: props.id}).fetch()[0];

	let orgsHandle = Meteor.subscribe('organizations', props.id);
	let orgs = Organizations.find({theme: props.id}).fetch();

	// Pre-filter the top orgs, add to loading condition
	let topOrgs = [];
	topOrgs = filterTopOrgs(theme, orgs);

	let loading = (!orgsHandle.ready() || _.isEmpty(orgs));

	return { loading, orgs, topOrgs };
})(OrganizationProviderTemplate);

export { OrganizationContext, OrganizationProvider };
