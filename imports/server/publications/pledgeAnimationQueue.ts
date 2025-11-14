import { Meteor } from "meteor/meteor"
import { PledgeAnimationQueue } from "/imports/api/db/PledgeAnimationQueue"

Meteor.publish("pledgeAnimationQueue", async function(themeId: string) {
	const queueItems = await PledgeAnimationQueue.find({ themeId, processed: false }, {
		sort: { timestamp: 1 },
	}).fetchAsync()

	queueItems.forEach(item => {
		this.added("pledgeAnimationQueue", item._id, item as unknown as Record<string, unknown>)
	})

	const observer = PledgeAnimationQueue.find({ themeId, processed: false }, {
		sort: { timestamp: 1 },
	}).observe({
		added: (doc) => {
			this.added("pledgeAnimationQueue", doc._id, doc as unknown as Record<string, unknown>)
		},
		changed: (doc) => {
			this.changed("pledgeAnimationQueue", doc._id, doc as unknown as Record<string, unknown>)
		},
		removed: (doc) => {
			this.removed("pledgeAnimationQueue", doc._id)
		},
	})

	this.onStop(() => {
		if(observer && typeof observer.stop === "function") {
			observer.stop()
		}
	})
	this.ready()
})

Meteor.startup(() => {
	if(Meteor.isServer) {
		PledgeAnimationQueue.createIndexAsync({ themeId: 1, processed: 1, timestamp: 1 })
	}
})

