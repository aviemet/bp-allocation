import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

const RoundsSchema = new SimpleSchema({
	one: Boolean,
	two: Boolean,
})

const Messages = new Mongo.Collection<Partial<Message>, Message>('messages')

const MessageSchema = new SimpleSchema({
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
		allowedValues: ['text', 'email'],
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
		label: 'Skip sending messages if member has voted in these rounds',
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
	updatedAt: {
		type: Date,
		required: false,
		autoValue: function () {
			if(this.isUpdate) {
				return new Date()
			}
		},
		optional: true,
	},
})

Messages.attachSchema(MessageSchema)

// Set permissions
Messages.allow({
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

export { Messages, MessageSchema }
