import { Random } from "meteor/random"
import SimpleSchema from "simpl-schema"

import SchemaRegex from "/imports/lib/schema"
import { CollectionPermissions } from "./index"

export const ChitVoteSchema = new SimpleSchema({
	weight: Number,
	count: Number,
})

export const MatchPledgeSchema = new SimpleSchema({
	_id: {
		type: String,
		regEx: SchemaRegex.Id,
		autoValue: function() {
			if(this.operator === "$push") {
				return Random.id()
			} else {
				this.unset() // Prevent user from supplying their own value
			}
		},
	},
	amount: {
		type: Number,
		required: true,
		defaultValue: 0,
	},
	member: {
		type: SchemaRegex.Id,
		required: false,
	},
	anonymous: {
		type: Boolean,
		required: false,
		defaultValue: false,
	},
	notes: {
		type: String,
		required: false,
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

export const OrganizationSchema = new SimpleSchema({
	title: {
		type: String,
		label: "Organization Name",
		min: 3,
		max: 50,
	},
	theme: SchemaRegex.Id,
	ask: {
		type: Number,
		label: "Funding Request Amount",
	},
	description: {
		type: String,
		label: "Organization Description",
		required: false,
	},
	image: {
		type: SchemaRegex.Id,
		label: "Organization Image",
		required: false,
	},
	chitVotes: {
		type: ChitVoteSchema,
		required: false,
		defaultValue: { weight: 0, count: 0 },
		label: "Amount of chit votes from first voting round",
	},
	amountFromVotes: {
		type: Number,
		required: false,
		defaultValue: 0,
		label: "Dollar amount allocated in second voting round",
	},
	topOff: {
		type: Number,
		required: false,
		defaultValue: 0,
		label: "Topoff value for crowd favorite",
	},
	pledges: {
		type: Array,
		defaultValue: [],
		required: false,
		label: "Array of matched pledges from members",
	},
	"pledges.$": MatchPledgeSchema,
	leverageFunds: {
		type: Number,
		required: false,
		defaultValue: 0,
		label: "Distribution of funds from final round of leverage assignment",
	},
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
export const organizationsPermissions: CollectionPermissions = {
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
