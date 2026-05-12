import { LogModels, type LogModel } from "/imports/api/db/Logs"

interface LinkSpec {
	metaKey: string
	buildHref: (id: string, themeId: string | undefined) => string | undefined
}

export const LogModelLinks: Partial<Record<LogModel, LinkSpec>> = {
	Member: {
		metaKey: "memberId",
		buildHref: (id, themeId) => themeId ? `/admin/${themeId}/members/${id}` : undefined,
	},
	MemberTheme: {
		metaKey: "memberId",
		buildHref: (id, themeId) => themeId ? `/admin/${themeId}/members/${id}` : undefined,
	},
	Organization: {
		metaKey: "organizationId",
		buildHref: (id, themeId) => themeId ? `/admin/${themeId}/orgs/${id}` : undefined,
	},
	Message: {
		metaKey: "messageId",
		buildHref: (id, themeId) => themeId ? `/admin/${themeId}/settings/messages/${id}` : undefined,
	},
	Theme: {
		metaKey: "themeId",
		buildHref: (_id, themeId) => themeId ? `/admin/${themeId}/overview` : undefined,
	},
	PresentationSettings: {
		metaKey: "themeId",
		buildHref: (_id, themeId) => themeId ? `/admin/${themeId}/settings/general` : undefined,
	},
}

const logModelValues: readonly string[] = Object.values(LogModels)
const isLogModel = (value: string): value is LogModel => logModelValues.includes(value)

export const resolveModelHref = (
	model: string,
	meta: Record<string, unknown> | undefined,
	themeId: string | undefined,
): string | undefined => {
	if(!isLogModel(model)) return undefined

	const spec = LogModelLinks[model]
	if(!spec) return undefined

	const id = meta?.[spec.metaKey]
	if(typeof id !== "string") return undefined

	return spec.buildHref(id, themeId)
}
