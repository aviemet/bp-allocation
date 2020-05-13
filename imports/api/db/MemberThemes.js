import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const AllocationSchema = new SimpleSchema({
	organization: SimpleSchema.RegEx.Id,
	amount: Number,
	createdAt: {
		type: Date,
		required: false,
		defaultValue: new Date()
	},
	voteSource: {
		type: String,
		required: false,
		allowedValues: ['kiosk', 'mobile'],
		defaultValue: 'kiosk'
	}
});

const ChitVoteSchema = new SimpleSchema({
	organization: SimpleSchema.RegEx.Id,
	votes: Number,
	createdAt: {
		type: Date,
		required: false,
		defaultValue: new Date()
	},
	voteSource: {
		type: String,
		required: false,
		allowedValues: ['kiosk', 'mobile'],
		defaultValue: 'kiosk'
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
	chits: { // Number of chits this member gets for round 1 voting
		type: Number,
		required: false,
		defaultValue: 5
	},
	amount: { // Amount of money this member has to allocate for round 2 voting
		type: Number,
		required: false
	},
	chitVotes: { // Distribution of chit votes round 1
		type: Array,
		defaultValue: [],
		required: false
	},
	'chitVotes.$': ChitVoteSchema,
	allocations: { // Alloction of money round 2
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
