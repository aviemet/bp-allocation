import { ValidatedMethod } from 'meteor/mdg:validated-method';

import moment from 'moment';

import { Themes, Organizations } from '/imports/api';
import OrganizationMethods from './OrganizationMethods';
import PresentationSettingsMethods from './PresentationSettingsMethods';

import _ from 'lodash';


const ThemeMethods = {
	/**
	 * Create new Theme
	 */
	create: new ValidatedMethod({
		name: 'themes.create',

		validate: null,

		run(data) {
			if(!data.quarter) {
				data.quarter = `${moment().year()}Q${moment().quarter()}`;
			}

			let theme = Themes.insert(_.merge(data, {presentationSettings: PresentationSettingsMethods.create.call()}));

			return theme;
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

			let data = {org: id, amount: amount};
			if(name) {
				data.name = name;
			}

			let result = Themes.update({_id: theme._id}, {
				$push: {
					saves: {
						$each: [data]
					}
				},
				$inc: {numTopOrgs: 1},
				$addToSet: {topOrgsManual: id}
			});

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
						leverageFunds: org.leverageFunds
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
						leverageFunds: 0
					}
				});
			});
		}
	})
};

export default ThemeMethods;
