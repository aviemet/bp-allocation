import { LogCategories, LogModels } from "/imports/api/db/Logs"
import { Meteor } from "meteor/meteor"

import { createLogger } from "./logger"

const isProduction = Meteor.isProduction

export const consoleLog = {
	/* eslint-disable no-console */
	log: (...args: Parameters<typeof console.log>) => isProduction ? null : console.log(...args),
	error: (...args: Parameters<typeof console.error>) => isProduction ? null : console.error(...args),
	info: (...args: Parameters<typeof console.info>) => isProduction ? null : console.info(...args),
	warn: (...args: Parameters<typeof console.warn>) => isProduction ? null : console.warn(...args),
	debug: (...args: Parameters<typeof console.debug>) => isProduction ? null : console.debug(...args),
	/* eslint-enable no-console */
}

export const publicationLog = createLogger({
	category: LogCategories.Publication,
})

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
