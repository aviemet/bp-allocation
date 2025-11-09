import SimpleSchema from "simpl-schema"

import SchemaRegex from "/imports/lib/schema"
import { CollectionPermissions } from "./index"

const OrgSaveSchema = new SimpleSchema({
	org: SchemaRegex.Id,
	amount: Number,
	name: {
		type: String,
		label: "Identity of person(s) who saved this org",
		required: false,
	},
})

const MessageStatusSchema = new SimpleSchema({
	messageId: SchemaRegex.Id,
	sending: Boolean,
	sent: Boolean,
	error: Boolean,
})


export const ThemeSchema = new SimpleSchema({
	title: {
		type: String,
		label: "Battery Powered Theme Title",
		min: 3,
		max: 200,
	},
	question: {
		type: String,
		label: "Theme Question",
		max: 200,
		required: false,
	},
	quarter: {
		type: String,
		label: "Fiscal Quarter for Theme",
		required: false,
	},
	organizations: {
		type: Array,
		defaultValue: [],
		required: false,
	},
	"organizations.$": SchemaRegex.Id,
	topOrgsManual: {
		type: Array,
		defaultValue: [],
		required: false,
	},
	"topOrgsManual.$": SchemaRegex.Id,
	numTopOrgs: {
		type: Number,
		defaultValue: 5,
		required: false,
	},
	chitWeight: {
		type: SimpleSchema.Integer,
		label: "Multiplicant weight of chits vs. non-present votes",
		required: false,
		defaultValue: 3,
	},
	matchRatio: {
		type: SimpleSchema.Integer,
		label: "Multiplicant of dollar match values in pledge round",
		required: false,
		defaultValue: 2,
	},
	consolationAmount: {
		type: Number,
		label: "Amount to allocate for not top 5",
		required: false,
		defaultValue: 10000,
	},
	consolationActive: {
		type: Boolean,
		label: "Will the bottom orgs receive consolation funds?",
		required: false,
		defaultValue: true,
	},
	leverageTotal: {
		type: Number,
		label: "Total amount to allocate for this theme",
		required: false,
		defaultValue: 0,
	},
	saves: {
		type: Array,
		defaultValue: [],
		required: false,
	},
	"saves.$": OrgSaveSchema,
	presentationSettings: {
		type: SchemaRegex.Id,
		required: false,
	},
	slug: {
		type: String,
		required: false,
	},
	messagesStatus: {
		type: Array,
		defaultValue: [],
		required: false,
	},
	"messagesStatus.$": MessageStatusSchema,
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
export const themesPermissions: CollectionPermissions = {
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
