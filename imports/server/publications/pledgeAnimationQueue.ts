import { Meteor } from "meteor/meteor"
import { PledgeAnimationQueue } from "/imports/api/db/PledgeAnimationQueue"

Meteor.publish("pledgeAnimationQueue", function(themeId: string) {
	return PledgeAnimationQueue.find({ themeId, processed: false }, {
		sort: { timestamp: 1 },
	})
})

Meteor.startup(() => {
	if(Meteor.isServer) {
		PledgeAnimationQueue.createIndexAsync({ themeId: 1, processed: 1, timestamp: 1 })
	}
})

