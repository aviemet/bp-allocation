import { Meteor } from "meteor/meteor"

import { textVotingLinkToMembers } from "/imports/server/sms"
import { emailVotingLinkToMembers } from "/imports/server/email"

Meteor.methods({
	textVotingLinkToMembers,
	emailVotingLinkToMembers,
})
