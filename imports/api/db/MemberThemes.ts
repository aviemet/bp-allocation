import SimpleSchema from "simpl-schema"

import SchemaRegex from "/imports/lib/schema"
import { CollectionPermissions } from "./index"

export const AllocationSchema = new SimpleSchema({
	organization: SchemaRegex.Id,
	amount: Number,
	voteSource: {
		type: String,
		required: false,
		allowedValues: ["kiosk", "mobile"],
		defaultValue: "kiosk",
	},
	createdAt: {
		type: Date,
		required: false,
		autoValue: function() {
			if(this.operator === "$push") {
				return new Date()
			} else {
				this.unset() // Prevent user from supplying their own value
			}
		},
	},
})

export const ChitVoteSchema = new SimpleSchema({
	organization: SchemaRegex.Id,
	votes: Number,
	voteSource: {
		type: String,
		required: false,
		allowedValues: ["kiosk", "mobile"],
		defaultValue: "kiosk",
	},
	createdAt: {
		type: Date,
		required: false,
		autoValue: function() {
			if(this.operator === "$push") {
				return new Date()
			} else {
				this.unset() // Prevent user from supplying their own value
			}
		},
	},
})


export const MemberThemeSchema = new SimpleSchema({
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
	"chitVotes.$": ChitVoteSchema,
	allocations: { // Allocation of money round 2
		type: Array,
		defaultValue: [],
		required: false,
	},
	"allocations.$": AllocationSchema,
	createdAt: {
		type: Date,
		required: false,
		autoValue: function() {
			if(this.isInsert) {
				return new Date()
			} else if(this.isUpsert) {
				return { $setOnInsert: new Date() }
			} else {
				this.unset() // Prevent user from supplying their own value
			}
		},
	},
})


// Set permissions
export const memberThemesPermissions: CollectionPermissions = {
	insert: (userId, doc) => {
		return true
	},
	update: (userId, doc) => {
		return true
	},
	remove: (userId, doc) => {
		return true
	},
}

