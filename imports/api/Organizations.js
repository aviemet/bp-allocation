import { Random } from 'meteor/random';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const ChitVoteSchema = new SimpleSchema({
	weight: Number,
	count: Number
});

const MatchPledgeSchema = new SimpleSchema({
	_id: {
		type: SimpleSchema.RegEx.Id,
		autoValue: () => Random.id()
	},
	amount: Number,
	member: {
		type: SimpleSchema.RegEx.Id,
		required: false
	},
	notes: {
		type: String,
		required: false
	},
	createdAt: {
		type: Date,
		required: false,
		defaultValue: new Date()
	}
});

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
	description: {
		type: String,
		label: 'Organization Description',
		required: false
	},
	image: {
		type: SimpleSchema.RegEx.Id,
		label: 'Organization Image',
		required: false
	},
	chitVotes: {
		type: ChitVoteSchema,
		required: false,
		defaultValue: { weight: 0, count: 0 },
		label: 'Amount of chit votes from first voting round'
	},
	amountFromVotes: {
		type: Number,
		required: false,
		defaultValue: 0,
		label: 'Dollar amount allocated in second voting round'
	},
	topOff: {
		type: Number,
		required: false,
		defaultValue: 0,
		label: 'Topoff value for crowd favorite'
	},
	pledges: {
		type: Array,
		defaultValue: [],
		required: false,
		label: 'Array of matched pledges from members'
	},
	'pledges.$': MatchPledgeSchema,
	leverageFunds: {
		type: Number,
		required: false,
		defaultValue: 0,
		label: 'Distribution of funds from final round of leverage assignment'
	},
	theme: SimpleSchema.RegEx.Id,
	createdAt: {
		type: Date,
		required: false,
		defaultValue: new Date()
	}
});

Organizations.attachSchema(OrganizationSchema);

// Set permissions
Organizations.allow({
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

export { Organizations, OrganizationSchema, ChitVoteSchema };
