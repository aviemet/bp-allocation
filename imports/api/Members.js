import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const AllocationSchema = new SimpleSchema({
	organization: SimpleSchema.RegEx.Id,
	amount: Number,
	createdAt: {
		type: Date,
		autoValue: () => new Date()
	}
});

const ChitVoteSchema = new SimpleSchema({
	organization: SimpleSchema.RegEx.Id,
	votes: Number,
	createdAt: {
		type: Date,
		autoValue: () => new Date()
	}
});

const MemberThemeSchema = new SimpleSchema({
	'contributions': {
		type: Number,
		required: false
	},
	chitVotes: {
		type: Array,
		defaultValue: [],
		required: false
	},
	'chitVotes.$': ChitVoteSchema,
	allocations: {
		type: Array,
		defaultValue: [],
		required: false
	},
	'allocations.$': AllocationSchema,
	createdAt: {
		type: Date,
		autoValue: () => new Date()
	}
});

const Members = new Mongo.Collection('members');

const MemberSchema = new SimpleSchema({
	firstName: String,
	lastName: String,
	number: {
		type: Number,
		required: false
	},
	theme: {
		type: Array,
		required: false
	},
	'theme.$': {
		type: MemberThemeSchema,
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
