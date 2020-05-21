import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

const Messages = new Mongo.Collection('messages')

const MessageSchema = new SimpleSchema({
	title: String,
	subject: {
		type: String,
		required: false
	},
	body: {
		type: String,
		required: false
	},
	type: {
		type: String,
		required: true,
		allowedValues: ['text', 'email']
	},
	active: {
		type: Boolean,
		required: false,
		defaultValue: true
	},
	includeLink: {
		type: Boolean,
		required: false,
		defaultValue: false
	},
	createdAt: {
		type: Date,
		required: false,
		defaultValue: new Date()
	}

})

Messages.attachSchema(MessageSchema)

// Set permissions
Messages.allow({
	insert: (userId, doc) => {
		return true
	},
	update: (userId, doc) => {
		return true
	},
	remove: (userId, doc) => {
		return true
	},
})

export { Messages, MessageSchema }
