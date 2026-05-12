/* eslint-disable no-console */
import { Meteor } from "meteor/meteor"

import { Logs } from "/imports/api/db"
import { LogCategories, LogModels, type LogCategory, type LogLevel, type LogModel } from "/imports/api/db/Logs"
import { type Log, type LogError } from "/imports/types/schema"

export { LogCategories, LogModels }
export type { LogCategory, LogLevel, LogModel }

export type LogModelInput = LogModel | LogModel[] | null

export interface LoggerSettings {
	category: LogCategory
	model?: LogModelInput
	meta?: Record<string, unknown>
}

export interface LogContext {
	themeId: string
	model?: LogModelInput
	meta?: Record<string, unknown>
	mirrorToConsole?: boolean
}

export interface ScopedLogger {
	debug: (action: string, message: string, context: LogContext) => void
	info: (action: string, message: string, context: LogContext) => void
	warn: (action: string, message: string, context: LogContext) => void
	error: (action: string, message: string, error: unknown, context: LogContext) => void
}

type LogDoc = Omit<Log, "_id" | "createdAt">

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null

const errorToLogError = (error: unknown): LogError | undefined => {
	if(error === undefined || error === null) return undefined

	if(error instanceof Error) {
		const result: LogError = { message: error.message }
		if(error.name) result.name = error.name
		if(error.stack) result.stack = error.stack
		if(isRecord(error) && typeof error.code === "string") result.code = error.code
		else if(isRecord(error) && typeof error.code === "number") result.code = String(error.code)
		return result
	}

	if(isRecord(error)) {
		const message = typeof error.message === "string" ? error.message : JSON.stringify(error)
		const result: LogError = { message }
		if(typeof error.name === "string") result.name = error.name
		if(typeof error.code === "string") result.code = error.code
		else if(typeof error.code === "number") result.code = String(error.code)
		if(typeof error.stack === "string") result.stack = error.stack
		return result
	}

	return { message: String(error) }
}

export const createLogger = (settings: LoggerSettings): ScopedLogger => {
	const { category } = settings

	const write = (
		level: LogLevel,
		action: string,
		message: string,
		context: LogContext,
		errorInput?: unknown,
	) => {
		const doc: LogDoc = { level, category, message, themeId: context.themeId }
		if(action) doc.action = action

		const modelInput = ("model" in context) ? context.model : settings.model
		if(modelInput !== undefined && modelInput !== null) {
			const modelArr = Array.isArray(modelInput) ? Array.from(new Set(modelInput)) : [modelInput]
			if(modelArr.length > 0) doc.model = modelArr
		}

		if(settings.meta || context.meta) {
			const meta = { ...settings.meta, ...context.meta }
			if(Object.keys(meta).length > 0) doc.meta = meta
		}

		if(level === "error") {
			const errorPayload = errorToLogError(errorInput)
			if(errorPayload) doc.error = errorPayload
		}

		if(context.mirrorToConsole) {
			const mirrored = { at: new Date().toISOString(), ...doc }
			if(level === "error") console.error(mirrored)
			else if(level === "warn") console.warn(mirrored)
			else console.log(mirrored)
		}

		if(Meteor.isServer) {
			Logs.insertAsync(doc).catch(persistError => {
				console.error("Logger persist failed:", persistError, "doc:", doc)
			})
		}
	}

	return {
		debug: (action, message, context) => write("debug", action, message, context),
		info:  (action, message, context) => write("info", action, message, context),
		warn:  (action, message, context) => write("warn", action, message, context),
		error: (action, message, error, context) => write("error", action, message, context, error),
	}
}
