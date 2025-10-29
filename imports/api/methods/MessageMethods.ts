import { ValidatedMethod } from "meteor/mdg:validated-method"
import { Meteor } from "meteor/meteor"
import { Messages } from "/imports/api/db"
import { Message } from "/imports/types/schema"

interface MessageCreateData extends Omit<Message, "_id" | "createdAt" | "updatedAt"> {}

interface MessageUpdateData {
	id: string
	data: Partial<Omit<Message, "_id" | "createdAt" | "updatedAt">>
}

const MessageMethods = {
	/**
	 * Create new Message
	 */
	create: new ValidatedMethod({
		name: "messages.create",

		validate: null,

		run(data: MessageCreateData) {
			try {
				return Messages.insert(data)
			} catch(exception) {
				throw new Meteor.Error("500", String(exception))
			}
		},
	}),

	/**
	 * Update Message
	 */
	update: new ValidatedMethod({
		name: "message.update",

		validate: null,

		run({ id, data }: MessageUpdateData) {
			try {
				return Messages.update({ _id: id }, { $set: data })
			} catch(exception) {
				throw new Meteor.Error("500", String(exception))
			}
		},
	}),

	/**
	 * Remove a Message
	 */
	remove: new ValidatedMethod({
		name: "messages.remove",

		validate: null,

		run(id: string) {
			return Messages.remove({ _id: id })
		},
	}),

}

export default MessageMethods
