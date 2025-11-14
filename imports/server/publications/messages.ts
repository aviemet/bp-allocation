import { Meteor } from "meteor/meteor"

import { Messages } from "/imports/api/db"

Meteor.publish("messages", async function() {
	const messages = await Messages.find({}).fetchAsync()
	messages.forEach(message => {
		this.added("messages", message._id, message as unknown as Record<string, unknown>)
	})

	const observer = Messages.find({}).observe({
		added: (doc) => {
			this.added("messages", doc._id, doc as unknown as Record<string, unknown>)
		},
		changed: (doc) => {
			this.changed("messages", doc._id, doc as unknown as Record<string, unknown>)
		},
		removed: (doc) => {
			this.removed("messages", doc._id)
		},
	})

	this.onStop(() => {
		if(observer && typeof observer.stop === "function") {
			observer.stop()
		}
	})
	this.ready()
})
