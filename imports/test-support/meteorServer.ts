import { Meteor } from "meteor/meteor"

export interface PublicationSmokeContext {
	userId: string | null
	added: (collection: string, id: string, fields: Record<string, unknown>) => void
	changed: (collection: string, id: string, fields: Record<string, unknown>) => void
	removed: (collection: string, id: string) => void
	ready: () => void
	onStop: (callback: () => void) => void
	error: (error: Error) => void
	stop: () => void
	wasReady: () => boolean
	_idFilter: {
		idStringify: (id: string) => string
		idParse: (id: string) => string
	}
	_documents: Record<string, Record<string, boolean>>
	_session: null
}

type DdpHandler = (...args: never[]) => unknown

interface MeteorDdpHandlers {
	publish_handlers: Record<string, DdpHandler>
	method_handlers: Record<string, DdpHandler>
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null
}

const isHandlerMap = (value: unknown): value is Record<string, DdpHandler> => {
	return isRecord(value)
}

const isMeteorDdpHandlers = (value: unknown): value is MeteorDdpHandlers => {
	if(!isRecord(value)) {
		return false
	}
	return isHandlerMap(value.publish_handlers) && isHandlerMap(value.method_handlers)
}

export const getMeteorDdpServer = (): MeteorDdpHandlers => {
	const server = Reflect.get(Meteor, "server")
	if(!isMeteorDdpHandlers(server)) {
		throw new Error("Meteor.server DDP handlers are unavailable in this environment")
	}
	return server
}

export const createPublicationSmokeContext = (): PublicationSmokeContext => {
	const stopCallbacks: Array<() => void> = []
	let readyCalled = false
	let stopped = false

	return {
		userId: null,
		added: () => undefined,
		changed: () => undefined,
		removed: () => undefined,
		ready: () => {
			readyCalled = true
		},
		onStop: callback => {
			stopCallbacks.push(callback)
		},
		error: error => {
			throw error
		},
		stop: () => {
			if(stopped) {
				return
			}
			stopped = true
			for(const callback of stopCallbacks) {
				callback()
			}
		},
		wasReady: () => readyCalled,
		_idFilter: {
			idStringify: id => String(id),
			idParse: id => id,
		},
		_documents: {},
		_session: null,
	}
}

export const invokePublication = async (
	name: string,
	args: unknown[] = [],
): Promise<{ context: PublicationSmokeContext, result: unknown }> => {
	const handlers = getMeteorDdpServer().publish_handlers
	const handler = handlers[name]
	if(typeof handler !== "function") {
		throw new Error(`Publication "${name}" is not registered`)
	}
	const context = createPublicationSmokeContext()
	const result = await Promise.resolve(
		Reflect.apply(handler, context, args),
	)
	return { context, result }
}
