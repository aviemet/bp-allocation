import { Meteor } from "meteor/meteor"

import { Messages } from "/imports/api/db"

Meteor.publish("messages", () => {
	return Messages.find({ })
})
