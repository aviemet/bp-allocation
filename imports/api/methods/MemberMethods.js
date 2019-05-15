import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

import { roundFloat } from '/imports/utils';

import { Members, MemberThemes } from '/imports/api';

const insertMember = query => {
	return new Promise((resolve, reject) => {
		Members.insert(query, (err, result) => {
			if(err) reject(err);
			resolve(result);
		})
	});
}

const insertMemberTheme = query => {
	return new Promise((resolve, reject) => {
		MemberThemes.insert(query, (err, result) => {
			if(err) reject(err);
			resolve(result);
		});
	});
}

const MemberMethods = {
	/**
	 * Create new Member
	 */
	upsert: new ValidatedMethod({
		name: 'members.upsert',

		validate: null,

		async run(data) {
			const { firstName, lastName, number, themeId, amount } = data;

			const query = { firstName, lastName, number: parseInt(number) };

			let member = Members.find(query).fetch()[0];
			if(!member) {
				memberId = await insertMember(query).then(result => result);
				member = Members.find({_id: memberId}).fetch()[0];
			}

			let memberTheme = MemberThemes.find({theme: themeId, member: member._id}).fetch()[0];
			console.log({memberThemeFound: memberTheme});
			if(!memberTheme) {
				console.log('nope');
				memberThemeId = await insertMemberTheme({theme: themeId, member: member._id}).then(result => result);
				memberTheme = MemberThemes.find({theme: themeId, member: member._id}).fetch()[0];
				console.log({memberId});
			}
			console.log({memberTheme});
			MemberThemes.update({_id: memberTheme._id}, {$set: {amount: amount}});
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
