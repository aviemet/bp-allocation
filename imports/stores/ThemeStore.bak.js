import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { withTracker } from 'meteor/react-meteor-data';

import { filterTopOrgs } from '/imports/lib/utils';

import { Themes, PresentationSettings, Organizations, MemberThemes } from '/imports/api';

/**
 * Initialize the Context
 */
const ThemeContext = React.createContext();

/**
 * Create a Provider with its own API to act as App-wide state store
 */
const ThemeProviderTemplate = props => {
	/**
	 * Sum of pledges made to top orgs
	 */
	const pledgedTotal = () => {
		if(_.isUndefined(props.topOrgs)) return 0;

		let total = 0;
		props.topOrgs.map(org => {
			if(org.pledges) {
				total += org.pledges.reduce((sum, pledge) => { return sum + pledge.amount; }, 0);
			}
		});
		return total;
	};

	/**
	 * Amount given to orgs other than top orgs
	 */
	const consolationTotal = () => {
		const loading = _.isUndefined(props.theme) || _.isUndefined(props.topOrgs) || _.isUndefined(props.topOrgs);
		if(loading || !props.theme.consolationActive || props.topOrgs.length < props.theme.numTopOrgs) return 0;
		return (props.theme.organizations.length - props.theme.numTopOrgs) * props.theme.consolationAmount;
	};

	/**
	 * Amount of the total pot still unassigned
	 *   Total Pot
	 * - Consolation
	 * - Member Votes
	 * - Crowd Favorite Topoff
	 * - Matched Pledges
	 * = leverageRemaining
	 */
	const leverageRemaining = () => {
		if(_.isUndefined(props.theme)) return 0;

		// Leverage moving forward into allocation round
		let remainingLeverage = (props.theme.leverageTotal) - consolationTotal();

		// Subtract the amounts allocated to each org
		props.topOrgs.map((org, i) => {
			// Amount from dollar voting round
			if(props.presentationSettings.useKioskFundsVoting) {
				org.amountFromVotes = 0;
				props.memberThemes.map(memberTheme => {
					let vote = _.find(memberTheme.allocations, ['organization', org._id]) || false;
					org.amountFromVotes += vote.amount || 0;
				});
			}
			remainingLeverage -= parseInt(org.amountFromVotes || 0);

			// The topoff for the crowd favorite
			if(org.topOff > 0){
				remainingLeverage -= org.topOff;
			}
			
			// Individual pledges from members
			if(!_.isEmpty(org.pledges)) {
				// TODO: This should be calculated based on the match ratio
				remainingLeverage -= org.pledges.reduce((sum, pledge) => { return sum + pledge.amount; }, 0);
			}
		});

		if(remainingLeverage <= 0) return 0; // Lower bounds check in case the total pot has not been set
		return parseFloat((remainingLeverage).toFixed(2));
	};

	/**
	 * Total amount of dollar votes
	 */
	const votedFunds = () => {
		if(_.isUndefined(props.topOrgs) || _.isUndefined(props.presentationSettings)) return 0;

		let voteAllocated = 0;
		// Calculate based on individual votes if using kiosk method
		if(props.presentationSettings.useKioskFundsVoting) {
			props.memberThemes.map(memberTheme => {
				voteAllocated += memberTheme.allocations.reduce((sum, allocation) => { return allocation.amount + sum; }, 0);
			});
		// Calculate total count if not using kiosk method
		} else {
			props.topOrgs.map((org) => {
				voteAllocated += parseFloat(org.amountFromVotes || 0);
				// voteAllocated += parseFloat(org.topOff || 0);
			});
		}
		return voteAllocated;
	};

	return (
		<ThemeContext.Provider value={ {
			theme: Object.assign({
				consolationTotal: consolationTotal(),
				leverageRemaining: leverageRemaining(),
				votedFunds: votedFunds(),
				pledgedTotal: pledgedTotal()
			}, props.theme),
			themeLoading: props.loading,
			handles: props.handles
		} }>
			{props.children}
		</ThemeContext.Provider>
	);
};

ThemeProviderTemplate.propTypes = {
	topOrgs: PropTypes.array,
	presentationSettings: PropTypes.object,
	memberThemes: PropTypes.array,
	theme: PropTypes.object,
	loading: PropTypes.bool,
	handles: PropTypes.object,
	children: PropTypes.object
};

const ThemeProvider = withTracker((props) => {
	if(!props.id) return { loading: true };

	// Get the theme
	const themesHandle = Meteor.subscribe('themes', props.id);
	const theme = Themes.find({ _id: props.id }).fetch()[0];

	const orgsHandle = Meteor.subscribe('organizations', props.id);
	const orgs = Organizations.find({ theme: props.id }).fetch();

	const memberThemesHandle = Meteor.subscribe('memberThemes', props.id);
	const memberThemes = MemberThemes.find({ theme: props.id }).fetch();

	if(_.isUndefined(theme) || _.isUndefined(orgs)) return { loading: true };

	const presentationSettingsHandle = Meteor.subscribe('presentationSettings', theme.presentationSettings);
	const presentationSettings = PresentationSettings.find({ _id: theme.presentationSettings }).fetch()[0];

	if(_.isUndefined(presentationSettings)) return { loading: true };

	// Pre-filter the top orgs, add to loading condition
	let topOrgs = [];
	topOrgs = filterTopOrgs(theme, orgs);

	const loading = (!themesHandle.ready() || _.isUndefined(theme) || _.isUndefined(presentationSettings));

	return { 
		loading, 
		theme, 
		topOrgs, 
		memberThemes, 
		presentationSettings, 
		handles: {
			themes: themesHandle, 
			presentationSettings: presentationSettingsHandle, 
			orgs: orgsHandle, 
			memberThemes: memberThemesHandle 
		}
	};
})(ThemeProviderTemplate);

const useTheme = () => useContext(ThemeContext);

export { ThemeContext, ThemeProvider, useTheme };
