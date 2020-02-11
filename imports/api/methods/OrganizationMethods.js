import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { roundFloat } from '/imports/lib/utils';

import { Themes, Organizations } from '/imports/api/db';
import ImageMethods from './ImageMethods';

const OrganizationMethods = {
	/**
	 * Create new Organization
	 */
	create: new ValidatedMethod({
		name: 'organizations.create',

		validate: null,

		run(data) {
			return Organizations.insert(data, (err, res) => {
				if(err){
					console.error(err);
				} else {
					Themes.update({ _id: data.theme }, {
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

		run({ id, data }) {
			return Organizations.update({ _id: id }, { $set: data });
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

					Themes.update({ _id: org.theme }, { $pull: { organizations: id }}, (err) => {
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
			var images = Organizations.find({ _id: { $in: ids }, image: { $exists: true }}, { _id: false, image: true }).map((org) => {
				return org.image;
			});

			// Remove the images
			ImageMethods.removeMany.call(images);

			// Remove organization
			Organizations.remove({ _id: { $in: ids }});


		}
	}),


	/**
	 * Add a matched pledge
	 */
	pledge: new ValidatedMethod({
		name: 'organizations.pledge',

		validate: null,

		run({ id, amount, member }) {
			amount = roundFloat(amount);

			const saveData = { amount };
			if(member) saveData.member = member;

			return Organizations.update({ _id: id }, {
				$push: {
					pledges: saveData
				}
			});
		}
	}),

	/**
	 * Remove a matched pledge
	 */
	removePledge: new ValidatedMethod({
		name: 'organizations.removePledge',

		validate: null,

		run({ orgId, pledgeId }) {
			return Organizations.update(
				{ _id: orgId },
				{
					$pull: {
						pledges: { _id: pledgeId }
					}
				},
				{ getAutoValues: false }
			);
		}
	}),


	/**
	 * Adjust Pledged Value
	 *
	 * Legacy: Pledges were a single value on the Organization model,
	 * changed to be array of pledges with optional relation to Members
	 */
	/*pledge: new ValidatedMethod({
		name: 'organizations.pledge',

		validate: null,

		run({id, amount, match, themeId}) {
			amount = roundFloat(amount);
			let theme = Themes.find({_id: themeId}).fetch()[0];

			// Pledge should increment org.pledged by twice the amount
			// increment theme.leverageUsed by the amount

			Themes.update({_id: themeId}, {$inc: {leverageUsed: amount}});

			return Organizations.update({_id: id}, {$inc: {pledges: (amount * parseInt(theme.matchRatio))}});
		}
	}),*/

	/**
	 * Top-off organization
	 */
	topOff: new ValidatedMethod({
		name: 'organizations.topOff',

		validate: null,

		run({ id, negate }) {
			negate = negate || false;

			let org = Organizations.find({ _id: id }).fetch()[0];

			let topOffAmount = 0;

			if(!negate)	{
				topOffAmount = org.ask - org.amountFromVotes - org.pledges;
			}

			return Organizations.update({ _id: id }, { $set: { topOff: topOffAmount }});
		}
	}),

	/**
	 * Reset organization funding totals
	 *
	 */
	reset: new ValidatedMethod({
		name: 'organizations.reset',

		validate: null,

		run({ id }) {
			// let org = Organizations.find({_id: id}).fetch()[0];
			// let theme = Themes.find({_id: org.theme}).fetch()[0];

			return Organizations.update({ _id: id }, {
				$set: {
					pledges: [],
					amountFromVotes: 0,
					topOff: 0
				}
			});
		}
	}),

};

export default OrganizationMethods;
