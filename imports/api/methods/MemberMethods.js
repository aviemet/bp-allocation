import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

import { roundFloat } from '/imports/utils';

import { Members, MemberThemes } from '/imports/api';

const memberInsert = function(query) {
	let member = Members.find(query).fetch()[0];

	return new Promise((resolve, reject) => {
		if(!member) {
			Members.insert(query, (err, result) => {
				if(err){
					reject(err);
				} else {
					resolve(result);
				}
			});
		} else {
			resolve(member._id);
		}
	});
}

const memberThemeInsert = function(query) {
	console.log({query});
	let memberTheme = MemberThemes.find({member: query.member, theme: query.theme}).fetch()[0];

	return new Promise((resolve, reject) => {
		if(!memberTheme) {
			MemberThemes.insert(query, (err, result) => {
				if(err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		} else {
			MemberThemes.update({_id: memberTheme._id}, {$set: {amount: query.amount}}, (err, result) => {
				if(err) {
					reject(err);
				} else {
					resolve(memberTheme._id);
				}
			});
		}
	});
}


const MemberMethods = {
	/**
	 * Create new Member
	 */
	upsert: new ValidatedMethod({
		name: 'members.upsert',

		validate: null,

		run(data) {
			// Get strange results if run on client
			if(Meteor.isServer) {
				const { firstName, lastName, number, themeId, amount } = data;
				const memberQuery = { firstName, lastName, number: parseInt(number) };

				memberInsert(memberQuery).then(member => {
					const memberThemeQuery = { member, amount, theme: themeId };

					memberThemeInsert(memberThemeQuery).then(memberTheme => {
						console.log({memberTheme});
						return memberTheme;
					}, memberThemeError => {
						console.error({memberThemeError});
					});

				}, memberError => {
					console.error({memberError});
				});

			}
		}
	}),

	/**
	 * Update Member
	 */
	removeMemberFromTheme: new ValidatedMethod({
		name: 'members.removeMemberFromTheme',

		validate: null,

		run({memberId, themeId}) {
			return MemberThemes.remove({member: memberId, theme: themeId});
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
	 * Record funds allocation vote for member for org
	 */
	fundVote: new ValidatedMethod({
		name: 'members.fundVote',

		validate: null,

		run({theme, member, org, amount}) {
			// Check for existing allocation for this org from this member
			let allocations = MemberThemes.find({theme, member}).fetch()[0].allocations;
			let allocation = _.find(allocations, ['organization', org]);

			// Update amount
			if(!allocation) {
				MemberThemes.update({theme: theme, member: member}, {
					$push: {
						allocations: { organization: org, amount: amount }
					}
				});
			// Or insert allocation vote
			} else {
				MemberThemes.update({
					theme: theme, member: member, allocations: {
						$elemMatch: {
							organization: org
						}
					}
				}, {
					$set: {
						'allocations.$.amount': amount
					}
				});
			}
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

}

export default MemberMethods;
