import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';

import { roundFloat } from '/imports/utils';

import { Members } from '/imports/api';
import { MembersSchema }  from '/imports/api/schema';

const MemberMethods = {
	/**
	 * Create new Member
	 */
	create: new ValidatedMethod({
		name: 'members.create',

		validate: null,

		run(data) {
			Members.insert(data, (err, res) => {
				if(err){
					console.error(err);
				} else {
					Themes.update({_id: data.theme}, {
						$push: { members: res }
					});
				}

			});
		}
	}),

	/**
	 * Update Member
	 */
	update: new ValidatedMethod({
		name: 'members.update',

		validate: null,

		run({id, data}) {
			return Members.update({_id: id}, {$set: data});
		}
	}),

	/**
	 * Delete Member
	 */
	remove: new ValidatedMethod({
		name: 'members.remove',

		validate: null,

		run(id) {
			let member = Members.findOne(id);
			if(!member){
				throw new Meteor.Error('MemberMethods.remove', 'Member to be removed was not found');
				return false;
			}

			// Remove member
			return Members.remove(id, (err) => {
				if(err) console.error(err);
			});


		}
	}),

	/**
	 * Batch Delete Members
	 */
	removeMany: new ValidatedMethod({
		name: 'members.removeMany',

		validate: null,

		run(ids) {
			// Get list of associated images to remove
			var images = Members.find({_id: {$in: ids}, image: {$exists: true}}, {_id: false, image: true}).map((org) => {
				return org.image;
			});

			// Remove the images
			ImageMethods.removeMany.call(images);

			// Remove organization
			Members.remove({_id: {$in: ids}});


		}
	}),


	/**
	 * Add matched pledge
	 */
	/*pledge: new ValidatedMethod({
		name: 'members.pledge',

		validate: null,

		run({id, amount, name}) {
			amount = roundFloat(amount);

			return Members.update({_id: id}, {
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
		name: 'members.pledge',

		validate: null,

		run({id, amount, match, themeId}) {
			amount = roundFloat(amount);
			let theme = Themes.find({_id: themeId}).fetch()[0];

			// console.log({id, amount, match, themeId, theme, matchRatio: amount * parseInt(theme.matchRatio)});

			// Pledge should increment org.pledged by twice the amount
			// increment theme.leverageUsed by the amount

			Themes.update({_id: themeId}, {$inc: {leverageUsed: amount}});

			// if(match){
			// 	let theme = Themes.find({_id: themeId}).fetch()[0];
			// 	ThemeMethods.update.call({id: themeId, data: {leverageUsed: parseInt(theme.leverageUsed) + amount}});
			// 	amount *= parseInt(theme.match_ratio);
			// }

			return Members.update({_id: id}, {$inc: {pledges: (amount * parseInt(theme.matchRatio))}});
		}
	}),

	/**
	 * Top-off organization
	 */
	topOff: new ValidatedMethod({
		name: 'members.topOff',

		validate: null,

		run({id}) {
			let org = Members.find({_id: id}).fetch()[0];
			// let theme = Themes.find({_id: org.theme}).fetch()[0];

			let topOffAmount = org.ask - org.amountFromVotes - org.pledges;

			// ThemeMethods.update.call({id: org.theme, data: {leverageUsed: parseInt(theme.leverageUsed) + topOffAmount}});

			return Members.update({_id: id}, {$set: {topOff: topOffAmount}});
		}
	}),

	/**
	 * Reset organization funding totals
	 *
	 */
	reset: new ValidatedMethod({
		name: 'members.reset',

		validate: null,

		run({id}) {
			let org = Members.find({_id: id}).fetch()[0];
			let theme = Themes.find({_id: org.theme}).fetch()[0];

			ThemeMethods.update.call({id: org.theme, data: {leverageUsed: parseInt(theme.leverageUsed || 0) - (org.pledges/2)}});

			return Members.update({_id: id}, {$set: {pledges: 0, amountFromVotes: 0, topOff: 0}});
		}
	}),

}

export default MemberMethods;
