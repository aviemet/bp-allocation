import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import { PledgeAnimationQueue } from "../db/PledgeAnimationQueue"
import { useData } from "../providers/DataProvider"

export const usePledgeAnimationQueue = () => {
	const data = useData()
	const themeId = data?.themeId

	return useTracker(() => {
		if(!themeId) {
			return {
				queueItems: [],
				queueLoading: true,
			}
		}

		const subscription = Meteor.subscribe("pledgeAnimationQueue", themeId)
		const subscriptionReady = subscription.ready()
		const queueItems = PledgeAnimationQueue.find({ themeId }, { sort: { timestamp: 1 } }).fetch()

		return {
			queueItems,
			queueLoading: !subscriptionReady,
		}
	}, [themeId])
}

