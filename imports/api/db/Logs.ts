import SimpleSchema from "simpl-schema"

import { CollectionPermissions } from "./index"

export const LogCategories = {
	Sms: "sms",
	Email: "email",
	Method: "method",
	Publication: "publication",
} as const
export type LogCategory = typeof LogCategories[keyof typeof LogCategories]

export const LogModels = {
	Member: "Member",
	MemberTheme: "MemberTheme",
	Message: "Message",
	Organization: "Organization",
	PresentationSettings: "PresentationSettings",
	Theme: "Theme",
	Image: "Image",
} as const
export type LogModel = typeof LogModels[keyof typeof LogModels]

export const LogLevels = ["debug", "info", "warn", "error"] as const
export type LogLevel = typeof LogLevels[number]

export interface LogsFilter {
	themeId: string
	categories?: LogCategory[]
	models?: string[]
	levels?: LogLevel[]
	since?: Date
	until?: Date
	search?: string
}

export const LogErrorSchema = new SimpleSchema({
	name: {
		type: String,
		required: false,
	},
	message: String,
	code: {
		type: String,
		required: false,
	},
	stack: {
		type: String,
		required: false,
	},
})

export const LogSchema = new SimpleSchema({
	createdAt: {
		type: Date,
		required: false,
		autoValue: function() {
			if(this.isInsert) {
				return new Date()
			} else if(this.isUpsert) {
				return { $setOnInsert: new Date() }
			} else {
				this.unset()
			}
		},
	},
	level: {
		type: String,
		required: true,
		allowedValues: [...LogLevels],
	},
	category: {
		type: String,
		required: true,
		allowedValues: Object.values(LogCategories),
	},
	model: {
		type: Array,
		required: false,
	},
	"model.$": {
		type: String,
		allowedValues: Object.values(LogModels),
	},
	action: {
		type: String,
		required: false,
	},
	message: {
		type: String,
		required: true,
	},
	themeId: {
		type: String,
		required: true,
	},
	error: {
		type: LogErrorSchema,
		required: false,
	},
	meta: {
		type: Object,
		blackbox: true,
		required: false,
	},
})

export const logsPermissions: CollectionPermissions = {
	insert: (_userId, _doc) => false,
	update: (_userId, _doc) => false,
	remove: (_userId, _doc) => false,
}
