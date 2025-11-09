import { ValidatedMethod } from "meteor/mdg:validated-method"
import { PledgeAnimationQueue } from "/imports/api/db/PledgeAnimationQueue"

interface EnqueuePledgeAnimationData {
	pledgeId: string
	orgId: string
	orgTitle: string
}

interface MarkProcessedData {
	queueItemId: string
}

const enqueuePledgeAnimation = new ValidatedMethod({
	name: "pledgeAnimation.enqueue",
	validate: null,
	async run(data: EnqueuePledgeAnimationData) {
		await PledgeAnimationQueue.insertAsync({
			pledgeId: data.pledgeId,
			orgId: data.orgId,
			orgTitle: data.orgTitle,
			timestamp: new Date(),
			processed: false,
		})
	},
})

const markProcessed = new ValidatedMethod({
	name: "pledgeAnimation.markProcessed",
	validate: null,
	async run(data: MarkProcessedData) {
		await PledgeAnimationQueue.updateAsync(data.queueItemId, {
			$set: { processed: true },
		})
	},
})

const PledgeAnimationMethods = {
	enqueuePledgeAnimation,
	markProcessed,
}

export default PledgeAnimationMethods

