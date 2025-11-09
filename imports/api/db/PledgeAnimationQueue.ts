import { Mongo } from "meteor/mongo"

interface PledgeAnimationQueueItem {
	_id: string
	pledgeId: string
	orgId: string
	orgTitle: string
	timestamp: Date
	processed: boolean
}

export const PledgeAnimationQueue = new Mongo.Collection<PledgeAnimationQueueItem>("pledgeAnimationQueue")

