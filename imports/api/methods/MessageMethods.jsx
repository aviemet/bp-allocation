import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Messages } from '/imports/api/db';

const MessageMethods = {
	/**
	 * Create new Message
	 */
	create: new ValidatedMethod({
		name: 'messages.create',

		validate: null,

		run(data) {
		}
	}),

	/**
	 * Update Message
	 */
	update: new ValidatedMethod({
		name: 'message.update',

		validate: null,

		run({ id, data }) {
			try {
				return Messages.update({ _id: id }, { $set: data });
			} catch(exception) {
				throw new Meteor.Error('500', exception);
			}
		}
	}),

	/**
	 * Remove a Message
	 */
	remove: new ValidatedMethod({
		name: 'messages.remove',

		validate: null,

		run(id) {
			return Messages.remove({ _id: id });
		}
	}),

};

export default MessageMethods;
