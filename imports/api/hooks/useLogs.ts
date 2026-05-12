import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import { Logs, type LogData } from "../db"
import { type LogsFilter } from "../db/Logs"

export const useLogs = (filter: LogsFilter | null, limit?: number): {
	logs: LogData[]
	logsLoading: boolean
} => {
	const filterKey = filter ? JSON.stringify(filter) : null

	return useTracker(() => {
		if(!filter) return { logs: [], logsLoading: false }

		const subscription = Meteor.subscribe("logs.recent", filter, limit)
		const subscriptionReady = subscription.ready()
		const logs = Logs.find({ themeId: filter.themeId }, { sort: { createdAt: -1 } }).fetch()

		return {
			logs,
			logsLoading: !subscriptionReady,
		}
	}, [filterKey, limit])
}
