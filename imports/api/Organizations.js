import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const ChitTallySchema = new SimpleSchema({
	weight: Number,
	count: Number
});
/*
const MatchPledgeSchema = new SimpleSchema({
	member: String,
	amount: Number,
	createdAt: {
		type: Date,
		autoValue: () => (new Date())
	}
});
*/
// Define Collection
const Organizations = new Mongo.Collection('organizations');

const OrganizationSchema = new SimpleSchema({
	title: {
		type: String,
		label: 'Organization Name'
	},
	ask: {
		type: Number,
		label: 'Funding Request Amount'
	},
	image: {
		type: SimpleSchema.RegEx.Id,
		label: 'Organization Image',
		required: false
	},
	chitVotes: {
		type: ChitTallySchema,
		required: false,
		defaultValue: { weight: 0, count: 0 }
	},
	amountFromVotes: {
		type: Number,
		required: false,
		defaultValue: 0
	},
	topOff: {
		type: Number,
		required: false,
		defaultValue: 0
	},
	pledges: {
		type: Number,
		required: false,
		defaultValue: 0
	},
	// pledges: {
	// 	type: Array,
	// 	defaultValue: [],
	// 	required: false
	// },
	// 'pledges.$': MatchPledgeSchema,
	leverageFunds: {
		type: Number,
		required: false,
		defaultValue: 0
	},
	theme: SimpleSchema.RegEx.Id,
	createdAt: {
		type: Date,
		autoValue: () => new Date()
	}
});

Organizations.attachSchema(OrganizationSchema);

// Set permissions
Organizations.allow({
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

export { Organizations, OrganizationSchema, ChitTallySchema };
