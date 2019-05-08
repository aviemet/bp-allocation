import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const AllocationSchema = new SimpleSchema({
	organization: SimpleSchema.RegEx.Id,
	amount: Number
});

const ChitVoteSchema = new SimpleSchema({
	organization: SimpleSchema.RegEx.Id
	votes: Number
});

const Members = new Mongo.Collection('members');

const MemberSchema = new SimpleSchema({
	firstName: String,
	lastName: String,
	number: {
		type: Number,
		required: false
	},
	amount: {
		type: Number,
		required: false
	},
	chitVotes: {
		type: Array,
		defaultValue: [],
		required: false
	},
	'chitVotes.$': ChitVoteSchema,
	allocation: {
		type: Array,
		defaultValue: [],
		required: false
	},
	'votes.$': VoteSchema,
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

export { Members, MemberSchema, AllocationSchema, ChitVoteSchema };
