import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const ChitVoteSchema = new SimpleSchema({
	weight: {
		type: Number,
		label: 'Weight of Chit Tokens',
		required: false
	},
	count: {
		type: Number,
		label: 'Count of Chit Tokens',
		required: false
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
	image: {
		type: String,
		label: 'Organization Image',
		required: false
	},
	chitVotes: {
		type: ChitVoteSchema,
		required: false,
		defaultValue: { weight: undefined, count: undefined }
	},
	value: {
		type: Number,
		required: false,
		defaultValue: 0
	},

	theme: SimpleSchema.RegEx.Id
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

export { Organizations, OrganizationSchema, ChitVoteSchema };
