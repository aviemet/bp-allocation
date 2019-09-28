import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Members = new Mongo.Collection('members');

const MemberSchema = new SimpleSchema({
	firstName: {
		type: String,
		required: false
	},
	lastName: {
		type: String,
		required: false
	},
	fullName: {
		type: String,
		required: false
	},
	initials: {
		type: String,
		required: false
	},
	number: {
		type: Number,
		label: 'Battery member number',
		required: true
	},
	code: {
		type: String,
		label: 'Code used for signing in to kiosk voting. Initials and number combined',
		required: false
	},
	phone: {
		type: String,
		label: 'Phone number to receive texts',
		required: false
	},
	createdAt: {
		type: Date,
		autoValue: () => new Date()
	}

});

Members.attachSchema(MemberSchema);

// Set permissions
Members.allow({
	insert: (userId, doc) => {
		return true;
	},
	update: (userId, doc) => {
		return true;
	},
	remove: (userId, doc) => {
		return true;
	},
});

export { Members, MemberSchema };
