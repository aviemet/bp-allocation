import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import _ from 'lodash';

import { roundFloat } from '/imports/utils';

import { withTracker } from 'meteor/react-meteor-data';

import { filterTopOrgs } from '/imports/utils';

import { Themes, Organizations, PresentationSettings, Members, MemberThemes } from '/imports/api';

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
		// if(_.isUndefined(props.settings) || _.isUndefined(props.orgs) || _.isUndefined(props.theme)) return {};
		if(props.loading) return {};

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
			org.pledgeTotal = 0;
			if(org.pledges) {
				org.pledgeTotal = org.pledges.reduce((sum, pledge) => { return sum + pledge.amount}, 0) * props.theme.matchRatio;
			}

			if(props.settings.useKioskFundsVoting) {
				org.amountFromVotes = 0;
				props.memberThemes.map(memberTheme => {
					let vote = _.find(memberTheme.allocations, ['organization', org._id]) || false;
					org.amountFromVotes += vote.amount || 0;
				});
			}
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
			handles: props.handles
		}}>
			{props.children}
		</OrganizationContext.Provider>
	);
}

const OrganizationProvider = withTracker(props => {
	if(!props.id) return { loading: true };

	let theme = Themes.find({_id: props.id}).fetch()[0];
	if(_.isUndefined(theme)) return { loading: true };

	let settings = PresentationSettings.find({_id: theme.presentationSettings}).fetch()[0];
	if(_.isUndefined(settings)) return { loading: true };

	let orgs = Organizations.find({theme: props.id}).fetch();

	// Get the members participating in this theme
	const memberThemes = MemberThemes.find({theme: props.id}).fetch();
	const memberIds = memberThemes.map(memberTheme => memberTheme.member);
	const members = Members.find({_id: {$in: memberIds}}).fetch();

	let loading = (!props.handles.orgs.ready() || _.isUndefined(orgs) || _.isUndefined(memberThemes));

	return { loading, orgs, theme, settings, members, memberThemes };
})(OrganizationProviderTemplate);

const useOrganizations = () => useContext(OrganizationContext);

export { OrganizationContext, OrganizationProvider, useOrganizations };
