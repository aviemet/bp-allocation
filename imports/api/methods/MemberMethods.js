import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import _ from 'lodash';

import { Members, MemberThemes } from '/imports/api';

/**
 * Upserts a member
 * @param  {Object} data {firstName, lastName, fullName, initials, number, amount}
 */
const memberInsert = function(data) {
	// Normalize the data
	let { firstName, lastName, fullName, number, initials } = data;
	let code;
	number = parseInt(number);
	if(!_.isUndefined(firstName)) firstName = firstName.trim();
	if(!_.isUndefined(lastName)) lastName = lastName.trim();
	if(!_.isUndefined(fullName)) fullName = fullName.trim();
	if(!_.isUndefined(initials)) initials = initials.trim();

	// Build first/last from fullName if not present
	if(_.isUndefined(firstName) && _.isUndefined(lastName) && !_.isUndefined(fullName)) {
		const nameArr = fullName.split(' ');
		if(nameArr.length === 2) {
			firstName = nameArr[0];
			lastName = nameArr[1];
		}
	}

	// Build fullName from first/last if not present
	if(_.isUndefined(fullName) && !_.isUndefined(firstName) && !_.isUndefined(lastName)) {
		fullName = firstName + ' ' + lastName;
	}

	// Build initials from first/last if not present
	if(_.isUndefined(initials) && !_.isUndefined(firstName) && !_.isUndefined(lastName)) {
		initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	}

	// Build code from initials and number
	if(!_.isUndefined(initials) && !_.isUndefined(number)) {
		code = `${initials}${String(number)}`;
	}

	// Build the query: Search by either of first/last or full name
	const memberQuery = { '$or': [] };
	if(!_.isUndefined(firstName) && !_.isUndefined(lastName)) {
		memberQuery.$or.push({ firstName, lastName, number });
	}
	if(!_.isUndefined(fullName)) {
		memberQuery.$or.push({ fullName, number });
	}

	// Check if the member already exists
	let member = Members.find(memberQuery).fetch()[0];

	return new Promise((resolve, reject) => {
		if(!member) {
			const newMember = { firstName, lastName, fullName, number, initials, code };
			try{
				Members.insert(newMember, (err, result) => {
					if(err){
						console.log({ newMember });
						reject(err);
					} else {
						resolve(result);
					}
				});
			} catch(e) {
				console.error(e);
			}
		} else {
			if(member.initials !== initials) {
				Members.update({ _id: member._id }, { $set: {
					initials: initials,
					code: code
				}});
			}
			resolve(member._id);
		}
	});
};

/**
 * Upserts a memberTheme assocication
 * @param  {Object} query
 */
const memberThemeInsert = function(query) {

	let memberTheme = MemberThemes.find({ member: query.member, theme: query.theme }).fetch()[0];

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
				MemberThemes.update({ _id: memberTheme._id }, { $set: { amount: query.amount }}, (err, result) => {
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
};


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
					const memberThemeQuery = { member, amount, theme: themeId };

					// Create/edit theme association
					memberThemeInsert(memberThemeQuery).then(memberTheme => {
						return memberTheme;
					}, memberThemeError => {
						console.error({ memberThemeError });
					});

				}, memberError => {
					console.error({ memberError });
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

		run({ memberId, themeId }) {
			return MemberThemes.remove({ member: memberId, theme: themeId });
		}
	}),

	/**
	 * Remove All Members From Theme
	 */
	removeAllMembers: new ValidatedMethod({
		name: 'members.removeAllMembers',

		validate: null,

		run(themeId) {
			const memberThemes = MemberThemes.find({ theme: themeId }, { _id: true, member: true }).fetch();
			const ids = memberThemes.map(memberTheme => {
				return memberTheme._id;
			});
			try {
				MemberThemes.remove({ _id: { $in: ids }});
			} catch(e) {
				console.error(e);
			}
		}
	}),

	/**
	 * Update Member
	 */
	update: new ValidatedMethod({
		name: 'members.update',

		validate: null,

		run({ id, data }) {
			return Members.update({ _id: id }, { $set: data });
		}
	}),

	/**
	 * Record funds allocation vote for member for org
	 */
	fundVote: new ValidatedMethod({
		name: 'members.fundVote',

		validate: null,

		run({ theme, member, org, amount }) {
			// Check for existing allocation for this org from this member
			let allocations = MemberThemes.find({ theme, member }).fetch()[0].allocations;
			let allocation = _.find(allocations, ['organization', org]);

			// Update amount
			if(!allocation) {
				MemberThemes.update({ theme: theme, member: member }, {
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
			}

			// Remove member
			return Members.remove(id, (err) => {
				if(err) console.error(err);
			});

		}
	}),

};

export default MemberMethods;
