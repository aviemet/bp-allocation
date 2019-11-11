import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const AllocationSchema = new SimpleSchema({
	organization: SimpleSchema.RegEx.Id,
	amount: Number,
	createdAt: {
		type: Date,
		required: false,
		defaultValue: new Date()
	}
});

const ChitVoteSchema = new SimpleSchema({
	organization: SimpleSchema.RegEx.Id,
	votes: Number,
	createdAt: {
		type: Date,
		required: false,
		defaultValue: new Date()
	}
});

/**
 * Voting information for a member on a specific theme
 * Members are persistent, can vote in multiple themes
 */
const MemberThemes = new Mongo.Collection('memberThemes');

const MemberThemeSchema = new SimpleSchema({
	theme: SimpleSchema.RegEx.Id,
	member: SimpleSchema.RegEx.Id,
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
	allocations: {
		type: Array,
		defaultValue: [],
		required: false
	},
	'allocations.$': AllocationSchema,
	createdAt: {
		type: Date,
		required: false,
		defaultValue: new Date()
	}
});

MemberThemes.attachSchema(MemberThemeSchema);

// Set permissions
MemberThemes.allow({
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

export { MemberThemes, MemberThemeSchema, AllocationSchema, ChitVoteSchema };
