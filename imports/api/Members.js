import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Members = new Mongo.Collection('members');

const MemberSchema = new SimpleSchema({
	firstName: String,
	lastName: String,
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
		return true
	},
	update: (userId, doc) => {
		return true
	},
	remove: (userId, doc) => {
		return true
	},
});

export { Members, MemberSchema, MemberThemeSchema, AllocationSchema, ChitVoteSchema };
