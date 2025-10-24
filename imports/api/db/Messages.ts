import SimpleSchema from "simpl-schema"

import { CollectionPermissions } from "./index"

export const RoundsSchema = new SimpleSchema({
	one: Boolean,
	two: Boolean,
})


export const MessageSchema = new SimpleSchema({
	title: String,
	subject: {
		type: String,
		required: false,
	},
	body: {
		type: String,
		required: false,
	},
	type: {
		type: String,
		required: true,
		allowedValues: ["text", "email"],
	},
	active: {
		type: Boolean,
		required: false,
		defaultValue: true,
	},
	order: {
		type: Number,
		required: false,
	},
	includeLink: {
		type: Boolean,
		required: false,
		defaultValue: false,
	},
	optOutRounds: {
		type: RoundsSchema,
		required: false,
		defaultValue: { one: false, two: false },
		label: "Skip sending messages if member has voted in these rounds",
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
	updatedAt: {
		type: Date,
		required: false,
		autoValue: function() {
			if(this.isUpdate) {
				return new Date()
			}
		},
		optional: true,
	},
})


// Set permissions
export const messagesPermissions: CollectionPermissions = {
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
