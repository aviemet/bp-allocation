import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

const OrgSaveSchema = new SimpleSchema({
	org: SimpleSchema.RegEx.Id,
	amount: Number,
	name: {
		type: String,
		label: 'Identity of person(s) who saved this org',
		required: false
	}
})

const MessageStatusSchema = new SimpleSchema({
	messageId: SimpleSchema.RegEx.Id,
	sending: Boolean,
	sent: Boolean,
	error: Boolean
})

// Define Collection
const Themes = new Mongo.Collection('themes')

const ThemeSchema = new SimpleSchema({
	title: {
		type: String,
		label: 'Battery Powered Theme Title',
		max: 200
	},
	question: {
		type: String,
		label: 'Theme Question',
		max: 200,
		required: false
	},
	quarter: {
		type: String,
		label: 'Fiscal Quarter for Theme',
		required: false
	},
	organizations: {
		type: Array,
		defaultValue: [],
		required: false,
	},
	'organizations.$': SimpleSchema.RegEx.Id,
	topOrgsManual: {
		type: Array,
		defaultValue: [],
		required: false
	},
	'topOrgsManual.$': SimpleSchema.RegEx.Id,
	numTopOrgs: {
		type: Number,
		defaultValue: 5,
		required: false
	},
	chitWeight: {
		type: SimpleSchema.Integer,
		label: 'Multiplicant weight of chits vs. non-present votes',
		required: false,
		defaultValue: 3
	},
	matchRatio: {
		type: SimpleSchema.Integer,
		label: 'Multiplicant of dollar match values in pledge round',
		required: false,
		defaultValue: 2
	},
	consolationAmount: {
		type: Number,
		label: 'Amount to allocate for not top 5',
		required: false,
		defaultValue: 10000
	},
	consolationActive: {
		type: Boolean,
		label: 'Will the bottom orgs receive consolation funds?',
		required: false,
		defaultValue: true
	},
	leverageTotal: {
		type: Number,
		label: 'Total amount to allocate for this theme',
		required: false,
		defaultValue: 0
	},
	saves: {
		type: Array,
		defaultValue: [],
		required: false
	},
	'saves.$': OrgSaveSchema,
	presentationSettings: SimpleSchema.RegEx.Id,
	createdAt: {
		type: Date,
		required: false,
		defaultValue: new Date()
	},
	slug: {
		type: String,
		required: false,
		index: true,
		unique: true
	},
	messagesStatus: {
		type: Array,
		defaultValue: [],
		required: false
	},
	'messagesStatus.$': MessageStatusSchema
})

Themes.attachSchema(ThemeSchema)

// Set permissions
Themes.allow({
	insert: (userId, doc) => {
		return true
	}
})

export { Themes, ThemeSchema }
