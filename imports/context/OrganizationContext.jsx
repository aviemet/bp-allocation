import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import _ from 'lodash';

import { roundFloat } from '/imports/utils';

import { withTracker } from 'meteor/react-meteor-data';

import { filterTopOrgs } from '/imports/utils';

import { Themes, Organizations } from '/imports/api';

/**
 * Initialize the Context
 */
const OrganizationContext = React.createContext();

/**
 * Create a Provider with its own API to act as App-wide state store
 */
const OrganizationProviderTemplate = props => {

	// Return only the top orgs for the theme, adding "virtual fields"
	getTopOrgs = () => {
		if(_.isUndefined(props.orgs) || _.isUndefined(props.theme)) return {};

		let topOrgs = filterTopOrgs(props.theme, props.orgs);

		// Pre-calculate values
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

			// Amount needed to reach goal
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
			orgsLoading: props.loading,
			handles: Object.assign({
				orgs: props.orgsHandle
			}, props.handles)
		}}>
			{props.children}
		</OrganizationContext.Provider>
	);
}

const OrganizationProvider = withTracker(props => {
	if(!props.id) return { loading: true };

	// let themeHandle = Meteor.subscribe('theme', props.id);
	let theme = Themes.find({_id: props.id}).fetch()[0];

	let orgsHandle = Meteor.subscribe('organizations', props.id);
	let orgs = Organizations.find({theme: props.id}).fetch();

	let loading = (!orgsHandle.ready() || _.isUndefined(orgs));

	return { loading, orgs, theme, orgsHandle };
})(OrganizationProviderTemplate);

const useOrganizations = () => useContext(OrganizationContext);

export { OrganizationContext, OrganizationProvider, useOrganizations };