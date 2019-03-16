import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';

import { Promise } from 'meteor/promise';

import { Themes, Organizations } from '/imports/api';
import { ThemesSchema }  from '/imports/api/schema';
import OrganizationMethods from './OrganizationMethods';

import _ from 'lodash';


const ThemeMethods = {
	/**
	 * Create new Theme
	 */
	create: new ValidatedMethod({
		name: 'themes.create',

		validate: null,

		run(data) {
			return Themes.insert(data);
		}
	}),

	/**
	 * Update Theme
	 */
	update: new ValidatedMethod({
		name: 'themes.update',

		validate: null,

		run({id, data}) {
			return Themes.update({_id: id}, {$set: data});
		}
	}),

	/**
	 * Remove a Theme
	 */
	remove: new ValidatedMethod({
		name: 'themes.remove',

		validate: null,

		run(id) {
			let orgs = Themes.findOne({_id: id}, {organizations: true});

			if(orgs.organizations.length > 0){
				OrganizationMethods.removeMany.call(orgs.organizations);
			}
			return Themes.remove({_id: id});
		}
	}),

	/**
	 * Manually toggle an organization in to "Top Orgs"
	 */
	topOrgToggle: new ValidatedMethod({
		name: 'themes.lockTopOrg',

		validate: null,

		run({theme_id, org_id}) {
			let theme = Themes.findOne({_id: theme_id}, {topOrgsManual: true});

			// Remove if exists
			if(theme.topOrgsManual.includes(org_id)){
				return Themes.update({_id: theme_id}, {
					$pull: {topOrgsManual: org_id}
				});
			}
			// Add if not exists
			return Themes.update({_id: theme_id}, {
				$addToSet: {topOrgsManual: org_id}
			});
		}
	}),

	/**
	 * Save an organization by funding 1/2 the ask
	 */
	saveOrg: new ValidatedMethod({
		name: 'themes.saveOrg',

		validate: null,

		run({id, amount, name}) {
			if(!id || !amount) return false;

			let org = Organizations.findOne({_id: id});
			let theme = Themes.findOne({_id: org.theme});

			console.log({theme});

			let data = {org: id, amount: amount}
			if(name) {
				data.name = name;
			}
			console.log({data});
			let result = Themes.update({_id: theme._id}, {
				$push: {
					saves: {
						$each: [data]
					}
				},
				$inc: {numTopOrgs: 1},
				$addToSet: {topOrgsManual: id}
			});
			console.log(result);
			return result;
		}
	}),

	/**
	 * Undo a saved Org
	 */
	unSaveOrg: new ValidatedMethod({
		name: 'themes.unSaveOrg',

		validate: null,

		run({theme_id, org_id}) {
			if(!theme_id || !org_id) return false;

			return Themes.update({_id: theme_id}, {
				$pull: {
					saves: {org: org_id},
					topOrgsManual: org_id
				},
				$inc: {numTopOrgs: -1}
			});
		}
	}),

	/**
	 * Assign Leverage Funds to Orgs
	 */
	saveLeverageSpread: new ValidatedMethod({
		name: 'organizations.saveLeverageSpread',

		validate: null,

		run(orgs) {
			orgs.map(org => {
				Organizations.update({_id: org._id}, {
					$set: {
						leverage_funds: org.leverage_funds
					}
				});
			});
		}
	}),

	/**
	 * Assign Leverage Funds to Orgs
	 */
	resetLeverage: new ValidatedMethod({
		name: 'organizations.resetLeverage',

		validate: null,

		run(orgs) {
			orgs.map(org => {
				Organizations.update({_id: org._id}, {
					$set: {
						leverage_funds: 0
					}
				});
			});
		}
	})
}

export default ThemeMethods;








/*
/**
	 * Get Top Orgs Sorted by chit votes
	 *
	filterTopOrgs: (theme, orgs) => {
		if(!theme){
			throw new Meteor.Error("No theme provided to ThemeMethods.filterTopOrgs");
			return;
		}
		// Save manual top orgs as key/value true/false pairs for reference
		let manualTopOrgs = {};
		theme.topOrgsManual.map((org) => {
			manualTopOrgs[org] = true;
		});

		// First sort orgs by weight and vote count
		let sortedOrgs = _.sortBy(orgs, (org) => {
			// Calculate the votes for each org (weight/chit_weight unless there's a manual count)
			let votes = org.chitVotes && org.chitVotes.count ? org.chitVotes.count :
									org.chitVotes && org.chitVotes.weight ? org.chitVotes.weight / theme.chit_weight : 0;

			// Save the votes count for later
			org.votes = votes;

			// Sort in descending order
			return -(votes)
		});

		let slice = theme.topOrgsManual.length;

		//Then bubble up the manual top orgs
		// No need to proceed if manual orgs is >= numTopOrgs
		if(theme.numTopOrgs >= theme.topOrgsManual.length){
			slice = theme.numTopOrgs;

			// climb up the bottom of the list looking for manually selected orgs
			for(let i = sortedOrgs.length-1; i >= theme.numTopOrgs; i--){
				// console.log({i: i, num: theme.numTopOrgs});
				// console.log({id: sortedOrgs[i]._id, index: i});
				// Check if the org has been manually selected
				if(manualTopOrgs[sortedOrgs[i]._id]){
					// Find the closest automatically selected top org
					let j = i-1;
					while(j > 0 && manualTopOrgs[sortedOrgs[j]._id]){
						j--;
					}

					// Start swapping the auto top org down the list
					while(j < i){
						let tmp = sortedOrgs[i];
						sortedOrgs[i] = sortedOrgs[j];
						sortedOrgs[j] = tmp;

						j++;
					}

					// Send the index back one in case we swapped another match into previous place
					i++;
				}
			}
		}

		return sortedOrgs.slice(0, slice);
	}
 */
