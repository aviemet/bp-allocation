import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import _ from 'lodash';

import { withTracker } from 'meteor/react-meteor-data';

import { filterTopOrgs } from '/imports/utils';

import { Themes, PresentationSettings, Organizations, Images, MemberThemes } from '/imports/api';
import { ThemeMethods, PresentationSettingsMethods, OrganizationMethods, ImageMethods } from '/imports/api/methods';

import { Loader } from 'semantic-ui-react'

/**
 * Initialize the Context
 */
const ThemeContext = React.createContext();

/**
 * Create a Provider with its own API to act as App-wide state store
 */
const ThemeProviderTemplate = props => {
	const pledgedTotal = () => {
		if(_.isUndefined(props.topOrgs)) return 0;

		let total = 0;
		props.topOrgs.map(org => {
			if(org.pledges) {
				total += org.pledges.reduce((sum, pledge) => { return sum + pledge.amount }, 0);
			}
		});
		return total;
	}

	const consolationTotal = () => {
		if(_.isUndefined(props.theme) || _.isUndefined(props.topOrgs) || !props.theme.consolationActive) return 0;
		return (props.theme.organizations.length - props.topOrgs.length) * props.theme.consolationAmount;
	}

	const leverageRemaining = () => {
		if(_.isUndefined(props.theme)) return 0;

		let remainingLeverage = (props.theme.leverageTotal || 0) - consolationTotal();

		props.topOrgs.map((org) => {
			remainingLeverage -= parseInt(org.amountFromVotes || 0);
			if(org.topOff > 0){
				remainingLeverage -= org.topOff;
			}
			if(!_.isEmpty(org.pledges)) {
				remainingLeverage -= org.pledges.reduce((sum, pledge) => { return sum + pledge.amount }, 0);
			}

		});
		if(remainingLeverage <= 0) return 0;
		return parseFloat((remainingLeverage).toFixed(2));
	}

	const votedFunds = () => {
		if(_.isUndefined(props.topOrgs) || _.isUndefined(props.presentationSettings)) return 0;

		let voteAllocated = 0;
		if(props.presentationSettings.useKioskFundsVoting) {
			props.memberThemes.map(memberTheme => {
				voteAllocated += memberTheme.allocations.reduce((sum, allocation) => { return allocation.amount + sum }, 0);
			});
		} else {
	 		props.topOrgs.map((org) => {
	 			voteAllocated += parseFloat(org.amountFromVotes || 0);
	 			voteAllocated += parseFloat(org.topOff || 0);
	 		});
	 	}
 		return voteAllocated;
	}

	return (
		<ThemeContext.Provider value={{
			theme: Object.assign({
				consolationTotal: consolationTotal(),
				leverageRemaining: leverageRemaining(),
				votedFunds: votedFunds(),
				pledgedTotal: pledgedTotal()
			}, props.theme),
			themeLoading: props.loading,
			handles: {
				themes: props.themesHandle,
				orgs: props.orgsHandle,
				memberThemes: props.memberThemesHandle,
				presentationSettings: props.presentationSettingsHandle
			}
		}}>
			{props.children}
		</ThemeContext.Provider>
	);
}

const ThemeProvider = withTracker((props) => {
	if(!props.id) return { loading: true };

	// Get the theme
	const themesHandle = Meteor.subscribe('themes', props.id);
	const theme = Themes.find({_id: props.id}).fetch()[0];

	const orgsHandle = Meteor.subscribe('organizations', props.id);
	const orgs = Organizations.find({theme: props.id}).fetch();

	const memberThemesHandle = Meteor.subscribe('memberThemes', props.id);
	const memberThemes = MemberThemes.find({theme: props.id}).fetch();

	if(_.isUndefined(theme) || _.isUndefined(orgs)) return { loading: true };

	const presentationSettingsHandle = Meteor.subscribe('presentationSettings', theme.presentationSettings);
	const presentationSettings = PresentationSettings.find({_id: theme.presentationSettings}).fetch()[0];

	// Pre-filter the top orgs, add to loading condition
	let topOrgs = [];
	topOrgs = filterTopOrgs(theme, orgs);

	const loading = (!themesHandle.ready() || _.isUndefined(theme) || _.isUndefined(presentationSettings));

	return { loading, theme, topOrgs, memberThemes, presentationSettings, themesHandle, presentationSettingsHandle, orgsHandle, memberThemesHandle };
})(ThemeProviderTemplate);

const useTheme = () => useContext(ThemeContext);

export { ThemeContext, ThemeProvider, useTheme };
