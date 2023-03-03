import { Random } from 'meteor/random'
import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import SchemaRegex from '/imports/lib/schema'

const ChitVoteSchema = new SimpleSchema({
	weight: Number,
	count: Number,
})

const MatchPledgeSchema = new SimpleSchema({
	_id: {
		type: SchemaRegex.Id,
		autoValue: () => Random.id(),
		index: true,
	},
	amount: Number,
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
		autoValue: function () {
			if(this.operator === '$push') {
				return new Date()
			} else {
				this.unset() // Prevent user from supplying their own value
			}
		},
	},
})

// Define Collection
const Organizations = new Mongo.Collection<Partial<Organization>, Organization>('organizations')

const OrganizationSchema = new SimpleSchema({
	title: {
		type: String,
		label: 'Organization Name',
		min: 3,
		max: 50,
	},
	theme: SchemaRegex.Id,
	ask: {
		type: Number,
		label: 'Funding Request Amount',
	},
	description: {
		type: String,
		label: 'Organization Description',
		required: false,
	},
	image: {
		type: SchemaRegex.Id,
		label: 'Organization Image',
		required: false,
	},
	chitVotes: {
		type: ChitVoteSchema,
		required: false,
		defaultValue: { weight: 0, count: 0 },
		label: 'Amount of chit votes from first voting round',
	},
	amountFromVotes: {
		type: Number,
		required: false,
		defaultValue: 0,
		label: 'Dollar amount allocated in second voting round',
	},
	topOff: {
		type: Number,
		required: false,
		defaultValue: 0,
		label: 'Topoff value for crowd favorite',
	},
	pledges: {
		type: Array,
		defaultValue: [],
		required: false,
		label: 'Array of matched pledges from members',
	},
	'pledges.$': MatchPledgeSchema,
	leverageFunds: {
		type: Number,
		required: false,
		defaultValue: 0,
		label: 'Distribution of funds from final round of leverage assignment',
	},
	createdAt: {
		type: Date,
		required: false,
		autoValue: function () {
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

Organizations.attachSchema(OrganizationSchema)

// Set permissions
Organizations.allow({
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

export { Organizations, OrganizationSchema, ChitVoteSchema }
