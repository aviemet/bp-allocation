import { Meteor } from "meteor/meteor"

import { Logs } from "/imports/api/db"
import { LogCategories, LogLevels, type LogCategory, type LogLevel, type LogsFilter } from "/imports/api/db/Logs"

const MAX_LIMIT = 1000
const DEFAULT_LIMIT = 200
const NONE_TOKEN = "(none)"

const ALLOWED_CATEGORIES = new Set<string>(Object.values(LogCategories))
const ALLOWED_LEVELS = new Set<string>(LogLevels)

const isStringArray = (value: unknown): value is string[] => {
	return Array.isArray(value) && value.every(item => typeof item === "string")
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null
}

const parseFilter = (raw: unknown): LogsFilter | null => {
	if(
		!isRecord(raw) ||
		typeof raw.themeId !== "string" ||
		raw.themeId.length === 0
	) return null

	const result: LogsFilter = { themeId: raw.themeId }

	if(isStringArray(raw.categories)) {
		const filtered = raw.categories.filter((value): value is LogCategory => ALLOWED_CATEGORIES.has(value))
		if(filtered.length > 0) result.categories = filtered
	}

	if(isStringArray(raw.models)) result.models = raw.models

	if(isStringArray(raw.levels)) {
		const filtered = raw.levels.filter((value): value is LogLevel => ALLOWED_LEVELS.has(value))
		if(filtered.length > 0) result.levels = filtered
	}

	if(raw.since instanceof Date) result.since = raw.since
	if(raw.until instanceof Date) result.until = raw.until

	if(typeof raw.search === "string" && raw.search.length > 0) result.search = raw.search

	return result
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const buildSelector = (filter: LogsFilter): Record<string, unknown> => {
	const selector: Record<string, unknown> = { themeId: filter.themeId }
	const conditions: Array<Record<string, unknown>> = []

	if(filter.categories && filter.categories.length > 0) {
		selector.category = { $in: filter.categories }
	}
	if(filter.levels && filter.levels.length > 0) {
		selector.level = { $in: filter.levels }
	}

	if(filter.models && filter.models.length > 0) {
		const hasNone = filter.models.includes(NONE_TOKEN)
		const realModels = filter.models.filter(modelName => modelName !== NONE_TOKEN)
		const modelClauses: Array<Record<string, unknown>> = []
		if(realModels.length > 0) modelClauses.push({ model: { $in: realModels } })
		if(hasNone) {
			modelClauses.push({ model: { $exists: false } })
			modelClauses.push({ model: { $size: 0 } })
		}
		if(modelClauses.length === 1) {
			Object.assign(selector, modelClauses[0])
		} else if(modelClauses.length > 1) {
			conditions.push({ $or: modelClauses })
		}
	}

	const dateClause: Record<string, Date> = {}
	if(filter.since) dateClause.$gte = filter.since
	if(filter.until) dateClause.$lte = filter.until
	if(Object.keys(dateClause).length > 0) {
		selector.createdAt = dateClause
	}

	if(filter.search) {
		const pattern = escapeRegex(filter.search)
		conditions.push({
			$or: [
				{ message: { $regex: pattern, $options: "i" } },
				{ action: { $regex: pattern, $options: "i" } },
			],
		})
	}

	if(conditions.length > 0) {
		selector.$and = conditions
	}

	return selector
}

Meteor.publish("logs.recent", async function(rawFilter: unknown, rawLimit: unknown) {
	const filter = parseFilter(rawFilter)
	if(!filter) {
		this.ready()
		return
	}
	const limit = Math.min(
		typeof rawLimit === "number" && rawLimit > 0 ? rawLimit : DEFAULT_LIMIT,
		MAX_LIMIT,
	)
	const selector = buildSelector(filter)
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
