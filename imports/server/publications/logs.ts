import { Meteor } from "meteor/meteor"

import { Logs } from "/imports/api/db"
import { buildLogsSelector, parseLogsFilter } from "/imports/server/publications/logsSelector"

const MAX_LIMIT = 1000
const DEFAULT_LIMIT = 200

Meteor.publish("logs.recent", async function(rawFilter: unknown, rawLimit: unknown) {
	const filter = parseLogsFilter(rawFilter)
	if(!filter) {
		this.ready()
		return
	}
	const limit = Math.min(
		typeof rawLimit === "number" && rawLimit > 0 ? rawLimit : DEFAULT_LIMIT,
		MAX_LIMIT,
	)
	const selector = buildLogsSelector(filter)
	const findOptions = { sort: { createdAt: -1 } as const, limit }

	const initial = await Logs.find(selector, findOptions).fetchAsync()
	initial.forEach(doc => {
		const { _id, ...fields } = doc
		this.added("logs", _id, fields)
	})

	const observer = Logs.find(selector, findOptions).observe({
		added: (doc) => {
			const { _id, ...fields } = doc
			this.added("logs", _id, fields)
		},
		changed: (doc) => {
			const { _id, ...fields } = doc
			this.changed("logs", _id, fields)
		},
		removed: (doc) => {
			this.removed("logs", doc._id)
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
		Logs.createIndexAsync({ createdAt: -1 })
		Logs.createIndexAsync({ category: 1, createdAt: -1 })
		Logs.createIndexAsync({ model: 1, createdAt: -1 })
		Logs.createIndexAsync({ level: 1, createdAt: -1 })
		Logs.createIndexAsync({ themeId: 1, createdAt: -1 })
	}
})
