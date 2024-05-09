import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import SchemaRegex from '/imports/lib/schema'

const AllocationSchema = new SimpleSchema({
	organization: SchemaRegex.Id,
	amount: Number,
	voteSource: {
		type: String,
		required: false,
		allowedValues: ['kiosk', 'mobile'],
		defaultValue: 'kiosk',
	},
	createdAt: {
		type: Date,
		required: false,
		autoValue: function() {
			if(this.operator === '$push'){
				return new Date()
			} else {
				this.unset()  // Prevent user from supplying their own value
			}
		},
	},
})

const ChitVoteSchema = new SimpleSchema({
	organization: SchemaRegex.Id,
	votes: Number,
	voteSource: {
		type: String,
		required: false,
		allowedValues: ['kiosk', 'mobile'],
		defaultValue: 'kiosk',
	},
	createdAt: {
		type: Date,
		required: false,
		autoValue: function() {
			if(this.operator === '$push'){
				return new Date()
			} else {
				this.unset()  // Prevent user from supplying their own value
			}
		},
	},
})

/**
 * Voting information for a member on a specific theme
 * Members are persistent, can vote in multiple themes
 */
const MemberThemes = new Mongo.Collection<Schema.MemberTheme, Partial<Schema.MemberTheme>>('memberThemes')

const MemberThemeSchema = new SimpleSchema({
	theme: SchemaRegex.Id,
	member: SchemaRegex.Id,
	chits: { // Number of chits this member gets for round 1 voting
		type: Number,
		required: false,
		defaultValue: 5,
	},
	amount: { // Amount of money this member has to allocate for round 2 voting
		type: Number,
		required: false,
	},
	chitVotes: { // Distribution of chit votes round 1
		type: Array,
		defaultValue: [],
		required: false,
	},
	'chitVotes.$': ChitVoteSchema,
	allocations: { // Alloction of money round 2
		type: Array,
		defaultValue: [],
		required: false,
	},
	'allocations.$': AllocationSchema,
	createdAt: {
		type: Date,
		required: false,
		autoValue: function() {
			if(this.isInsert) {
				return new Date()
			} else if(this.isUpsert) {
				return { $setOnInsert: new Date() }
			} else {
				this.unset()  // Prevent user from supplying their own value
			}
		},
	},
})

MemberThemes.attachSchema(MemberThemeSchema)

// Set permissions
MemberThemes.allow({
	insert: (_userId, _doc) => {
		return true
	},
	update: (_userId, _doc) => {
		return true
	},
	remove: (_userId, _doc) => {
		return true
	},
})

export { MemberThemes, MemberThemeSchema, AllocationSchema, ChitVoteSchema }
