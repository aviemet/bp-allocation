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
			return Members.insert(data, (err, res) => {
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

}

export default MemberMethods;
