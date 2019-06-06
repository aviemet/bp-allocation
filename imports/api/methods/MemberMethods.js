import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

import { roundFloat } from '/imports/utils';

import { Members, MemberThemes } from '/imports/api';

/**
 * Upserts a member
 * @param  {Object} data {firstName, lastName, fullName, initials, number, amount}
 */
const memberInsert = function(data) {
	// Normalize the data
	let { firstName, lastName, fullName, number, initials } = data;
	number = parseInt(number);
	if(!_.isEmpty(firstName)) firstName = firstName.trim();
	if(!_.isEmpty(lastName)) lastName = lastName.trim();
	if(!_.isEmpty(fullName)) fullName = fullName.trim();

	// Build first/last from fullName if not present
	if(_.isEmpty(firstName) && _.isEmpty(lastName) && !_.isEmpty(fullName)) {
		const nameArr = fullName.split(' ');
		if(nameArr.length === 2) {
			firstName = nameArr[0];
			lastName = nameArr[1];
		}
	}

	// Build fullName from first/last if not present
	if(_.isEmpty(fullName) && !_.isEmpty(firstName) && !_.isEmpty(lastName)) {
		fullName = firstName + ' ' + lastName;
	}

	// Build initials from first/last if not present
	if(!_.isEmpty(firstName) && !_.isEmpty(lastName)) {
		initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	}

	// Build the query: Search by either of first/last or full name
	const memberQuery = {'$or': []};
	if(!_.isEmpty(firstName) && !_.isEmpty(lastName)) {
		memberQuery.$or.push({firstName, lastName, number});
	}
	if(!_.isEmpty(fullName)) {
		memberQuery.$or.push({fullName, number});
	}

	// Check if the member already exists
	let member = Members.find(memberQuery).fetch()[0];

	return new Promise((resolve, reject) => {
		if(!member) {
			const newMember = { firstName, lastName, fullName, number, initials };
			try{
				Members.insert(newMember, (err, result) => {
					if(err){
						reject(err);
					} else {
						resolve(result);
					}
				});
			} catch(e) {
				console.error(e);
			}
		} else {
			resolve(member._id);
		}
	});
}

/**
 * Upserts a memberTheme assocication
 * @param  {Object} query
 */
const memberThemeInsert = function(query) {

	let memberTheme = MemberThemes.find({member: query.member, theme: query.theme}).fetch()[0];

	return new Promise((resolve, reject) => {
		if(!memberTheme) {
			try {
				MemberThemes.insert(query, (err, result) => {
					if(err) {
						reject(err);
					} else {
						resolve(result);
					}
				});
			} catch(e) {
				console.error(e);
			}
		} else {
			try {
				MemberThemes.update({_id: memberTheme._id}, {$set: {amount: query.amount}}, (err, result) => {
					if(err) {
						reject(err);
					} else {
						resolve(memberTheme._id);
					}
				});
			} catch(e) {
				console.error(e);
			}
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
			const { amount, themeId } = data;
			// Get strange results if run on client
			if(Meteor.isServer) {

				// Create/edit member
				memberInsert(data).then(member => {
					console.log({data});
					const memberThemeQuery = { member, amount, theme: themeId };

					// Create/edit theme association
					memberThemeInsert(memberThemeQuery).then(memberTheme => {
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
