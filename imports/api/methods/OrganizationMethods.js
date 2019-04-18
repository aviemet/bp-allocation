import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';

import { roundFloat } from '/imports/utils';

import { Themes, Organizations, Images } from '/imports/api';
import { OrganizationsSchema }  from '/imports/api/schema';
import ImageMethods from './ImageMethods';
import ThemeMethods from './ThemeMethods';

const OrganizationMethods = {
	/**
	 * Create new Organization
	 */
	create: new ValidatedMethod({
		name: 'organizations.create',

		validate: null,

		run(data) {
			Organizations.insert(data, (err, res) => {
				if(err){
					console.error(err);
				} else {
					Themes.update({_id: data.theme}, {
						$push: { organizations: res }
					});
				}

			});
		}
	}),

	/**
	 * Update Organization
	 */
	update: new ValidatedMethod({
		name: 'organizations.update',

		validate: null,

		run({id, data}) {
			return Organizations.update({_id: id}, {$set: data});
		}
	}),

	/**
	 * Delete Organization
	 */
	remove: new ValidatedMethod({
		name: 'organizations.remove',

		validate: null,

		run(id) {
			let org = Organizations.findOne(id);
			if(org){
				// First delete any associated images
				if(org.image){
					ImageMethods.remove.call(org.image);
				}

				// Remove organization
				return Organizations.remove(id, (err) => {
					if(err) console.error(err);

					Themes.update({_id: org.theme}, {$pull: {organizations: id}}, (err) => {
						if(err) console.error(err);
					});
				});
			} else {
				throw new Meteor.Error('OrganizationMethods.remove', 'Organization to be removed was not found');
			}


		}
	}),

	/**
	 * Batch Delete Organizations
	 */
	removeMany: new ValidatedMethod({
		name: 'organizations.removeMany',

		validate: null,

		run(ids) {
			// Get list of associated images to remove
			var images = Organizations.find({_id: {$in: ids}, image: {$exists: true}}, {_id: false, image: true}).map((org) => {
				return org.image;
			});

			// Remove the images
			ImageMethods.removeMany.call(images);

			// Remove organization
			Organizations.remove({_id: {$in: ids}});


		}
	}),


	/**
	 * Add matched pledge
	 */
	/*pledge: new ValidatedMethod({
		name: 'organizations.pledge',

		validate: null,

		run({id, amount, name}) {
			amount = roundFloat(amount);

			return Organizations.update({_id: id}, {
				$push: {
					pledges: {
						amount: roundFloat(amount),
						name: name || ''
					}
				}
			});
		}
	}),*/


	/**
	 * Adjust Pledged Value
	 */
	pledge: new ValidatedMethod({
		name: 'organizations.pledge',

		validate: null,

		run({id, amount, match, themeId}) {
			amount = roundFloat(amount);
			let theme = Themes.find({_id: themeId}).fetch()[0];

			console.log({id, amount, match, themeId, theme, matchRatio: amount * parseInt(theme.matchRatio)});

			// Pledge should increment org.pledged by twice the amount
			// increment theme.leverageUsed by the amount

			Themes.update({_id: themeId}, {$inc: {leverageUsed: amount}});

			// if(match){
			// 	let theme = Themes.find({_id: themeId}).fetch()[0];
			// 	ThemeMethods.update.call({id: themeId, data: {leverageUsed: parseInt(theme.leverageUsed) + amount}});
			// 	amount *= parseInt(theme.match_ratio);
			// }

			return Organizations.update({_id: id}, {$inc: {pledges: (amount * parseInt(theme.matchRatio))}});
		}
	}),

	/**
	 * Top-off organization
	 */
	topOff: new ValidatedMethod({
		name: 'organizations.topOff',

		validate: null,

		run({id}) {
			let org = Organizations.find({_id: id}).fetch()[0];
			// let theme = Themes.find({_id: org.theme}).fetch()[0];

			let topOffAmount = org.ask - org.amountFromVotes - org.pledges;

			// ThemeMethods.update.call({id: org.theme, data: {leverageUsed: parseInt(theme.leverageUsed) + topOffAmount}});

			return Organizations.update({_id: id}, {$set: {topOff: topOffAmount}});
		}
	}),

	/**
	 * Reset organization funding totals
	 *
	 */
	reset: new ValidatedMethod({
		name: 'organizations.reset',

		validate: null,

		run({id}) {
			let org = Organizations.find({_id: id}).fetch()[0];
			let theme = Themes.find({_id: org.theme}).fetch()[0];

			ThemeMethods.update.call({id: org.theme, data: {leverageUsed: parseInt(theme.leverageUsed || 0) - (org.pledges/2)}});

			return Organizations.update({_id: id}, {$set: {pledges: 0, amountFromVotes: 0, topOff: 0}});
		}
	}),

}

export default OrganizationMethods;
