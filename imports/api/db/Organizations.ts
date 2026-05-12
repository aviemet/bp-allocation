import { Random } from "meteor/random"
import SimpleSchema from "simpl-schema"

import { SchemaRegex } from "/imports/lib/schema"
import { CollectionPermissions } from "./index"

/**
 * Aggregate chit vote summary for manual entry mode
 * Used when physical wooden chits are weighed/counted and entered by admins
 * weight: Total weight of chits in grams
 * count: Direct count of chits (takes precedence over weight)
 */
export const OrgChitVoteSummarySchema = new SimpleSchema({
	weight: {
		type: Number,
		optional: true,
		defaultValue: 0,
	},
	count: {
		type: Number,
		optional: true,
		defaultValue: 0,
	},
})

export const MatchPledgeSchema = new SimpleSchema({
	_id: {
		type: String,
		regEx: SchemaRegex.Id,
		autoValue: function() {
			if(this.operator === "$push") {
				return Random.id()
			}
			// Returning undefined leaves the field untouched. Crucially this means
			// $pull filters like { pledges: { _id: someId } } still match by _id;
			// previously a this.unset() branch here stripped _id from the filter
			// and caused $pull to remove every pledge in the array.
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
	pledgeType: {
		type: String,
		allowedValues: ["standard", "inPerson"],
		defaultValue: "standard",
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
		type: OrgChitVoteSummarySchema,
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
	// NOTE: persisted as `topOff` for backwards compatibility with existing data;
	// conceptually this is the dollar amount needed to fully fund the crowd-favorite
	// (or to top each org up to the minimum-leverage target). TODO: migrate to a
	// clearer field name (e.g. `crowdFavoriteAmount`) and remove this note.
	topOff: {
		type: Number,
		required: false,
		defaultValue: 0,
		label: "Crowd-favorite fully-funded amount",
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
	insert: (_userId, _doc) => {
		return true
	},
	update: (_userId, _doc) => {
		return true
	},
	remove: (_userId, _doc) => {
		return true
	},
}
