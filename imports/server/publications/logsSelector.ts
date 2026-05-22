import { LogCategories, LogLevels, type LogCategory, type LogLevel, type LogsFilter } from "/imports/api/db/Logs"

const NONE_TOKEN = "(none)"

const ALLOWED_CATEGORIES = new Set<string>(Object.values(LogCategories))
const ALLOWED_LEVELS = new Set<string>(LogLevels)

const isStringArray = (value: unknown): value is string[] => {
	return Array.isArray(value) && value.every(item => typeof item === "string")
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null
}

export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const buildLogSearchCondition = (search: string): Record<string, unknown> => {
	const pattern = escapeRegex(search)
	const regex = { $regex: pattern, $options: "i" }
	return {
		$or: [
			{ message: regex },
			{ action: regex },
			{ category: regex },
			{ level: regex },
			{ _id: regex },
			{ model: regex },
			{ "error.message": regex },
			{ "error.name": regex },
			{ "error.code": regex },
			{ "error.stack": regex },
			{
				$expr: {
					$regexMatch: {
						input: {
							$reduce: {
								input: { $objectToArray: { $ifNull: ["$meta", {}] } },
								initialValue: "",
								in: {
									$concat: [
										"$$value",
										" ",
										{
											$convert: {
												input: "$$this.v",
												to: "string",
												onError: "",
												onNull: "",
											},
										},
									],
								},
							},
						},
						regex: pattern,
						options: "i",
					},
				},
			},
		],
	}
}

export const parseLogsFilter = (raw: unknown): LogsFilter | null => {
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

export const buildLogsSelector = (filter: LogsFilter): Record<string, unknown> => {
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
		conditions.push(buildLogSearchCondition(filter.search))
	}

	if(conditions.length > 0) {
		selector.$and = conditions
	}

	return selector
}
