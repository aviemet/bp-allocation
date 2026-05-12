import { LogCategories, LogModels } from "/imports/api/db/Logs"

import { createLogger } from "./logger"

export const smsLog = createLogger({
	category: LogCategories.Sms,
	model: [LogModels.Member, LogModels.Message],
})

export const emailLog = createLogger({
	category: LogCategories.Email,
	model: [LogModels.Member, LogModels.Message],
})

export const memberMethodLog = createLogger({
	category: LogCategories.Method,
	model: [LogModels.Member],
})

export const organizationMethodLog = createLogger({
	category: LogCategories.Method,
	model: [LogModels.Organization],
})
