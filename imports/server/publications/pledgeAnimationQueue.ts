import { Meteor } from "meteor/meteor"
import { PledgeAnimationQueue } from "/imports/api/db/PledgeAnimationQueue"

Meteor.publish("pledgeAnimationQueue", function() {
	return PledgeAnimationQueue.find({ processed: false }, {
		sort: { timestamp: 1 },
	})
})

Meteor.startup(() => {
	if(Meteor.isServer) {
		PledgeAnimationQueue.createIndexAsync({ processed: 1, timestamp: 1 })
	}
})

