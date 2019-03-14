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
					console.log(err);
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
					if(err) console.log(err);

					Themes.update({_id: org.theme}, {$pull: {organizations: id}}, (err) => {
						if(err) console.log(err);
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
			amount = parseInt(amount);
			let theme = Themes.find({_id: themeId}).fetch()[0];

			// Pledge should increment org.pledged by twice the amount
			// increment theme.leverage_used by the amount

			Themes.update({_id: themeId}, {$inc: {leverage_used: amount}});

			// if(match){
			// 	let theme = Themes.find({_id: themeId}).fetch()[0];
			// 	ThemeMethods.update.call({id: themeId, data: {leverage_used: parseInt(theme.leverage_used) + amount}});
			// 	amount *= parseInt(theme.match_ratio);
			// }

			return Organizations.update({_id: id}, {$inc: {pledges: (amount * parseInt(theme.match_ratio))}});
		}
	}),

	/**
	 * Top-off organization
	 */
	topoff: new ValidatedMethod({
		name: 'organizations.topoff',

		validate: null,

		run({id}) {
			let org = Organizations.find({_id: id}).fetch()[0];
			// let theme = Themes.find({_id: org.theme}).fetch()[0];

			let topoffAmount = org.ask - org.amount_from_votes - org.pledges;

			// ThemeMethods.update.call({id: org.theme, data: {leverage_used: parseInt(theme.leverage_used) + topoffAmount}});

			return Organizations.update({_id: id}, {$set: {topoff: topoffAmount}});
		}
	}),

	/**
	 * Reset organization
	 */
	reset: new ValidatedMethod({
		name: 'organizations.reset',

		validate: null,

		run({id}) {
			let org = Organizations.find({_id: id}).fetch()[0];
			let theme = Themes.find({_id: org.theme}).fetch()[0];

			let resetAmount = org.ask - org.amount_from_votes - org.pledges;

			ThemeMethods.update.call({id: org.theme, data: {leverage_used: parseInt(theme.leverage_used) - (org.pledges/2)}});

			return Organizations.update({_id: id}, {$set: {pledges: 0, amount_from_votes: 0, topoff: 0}});
		}
	}),

}

export default OrganizationMethods;
