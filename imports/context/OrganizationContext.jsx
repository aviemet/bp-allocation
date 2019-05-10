import { Meteor } from 'meteor/meteor';
import React from 'react';
import _ from 'lodash';

import { roundFloat } from '/imports/utils';

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
const OrganizationProviderTemplate = props => {

	getTopOrgs = () => {
		if(_.isUndefined(props.orgs) || _.isUndefined(props.theme)) return {};

		let topOrgs = filterTopOrgs(props.theme, props.orgs);

		topOrgs = topOrgs.map(org => {
			// Get save amount if saved
			org.save = 0;
			if(!_.isEmpty(props.theme.saves)) {
				org.save = (() => {
					let saveObj = props.theme.saves.find( save => save.org === org._id);
					return saveObj ? (saveObj.amount || 0) : 0;
				})();
			}

			// Total of funds pledged for this org multiplied by the match ratio
			org.pledgeTotal = org.pledges.reduce((sum, pledge) => { return sum + pledge.amount}, 0) * props.theme.matchRatio;

			// Total amount of money allocted to this org aside from leverage distribution
			org.allocatedFunds = roundFloat((org.amountFromVotes || 0) + org.pledgeTotal + org.save + org.topOff);

			let need = org.ask - org.allocatedFunds - org.leverageFunds;
			org.need = roundFloat(need > 0 ? need : 0);

			return org;
		});

		return topOrgs;
	}

	return (
		<OrganizationContext.Provider value={{
			orgs: props.orgs,
			topOrgs: getTopOrgs(),
			orgsLoading: props.loading
		}}>
			{props.children}
		</OrganizationContext.Provider>
	);
}

const OrganizationProvider = withTracker((props) => {
	if(!props.id) return { loading: true };

	let themeHandle = Meteor.subscribe('theme', props.id);
	let theme = Themes.find({_id: props.id}).fetch()[0];

	let orgsHandle = Meteor.subscribe('organizations', props.id);
	let orgs = Organizations.find({theme: props.id}).fetch();

	let loading = (!orgsHandle.ready() || _.isUndefined(orgs));

	return { loading, orgs, theme };
})(OrganizationProviderTemplate);

export { OrganizationContext, OrganizationProvider };
