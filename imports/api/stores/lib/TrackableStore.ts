import { isEqual } from "lodash"

export type TrackableData<T = Record<string, unknown>> = T & {
	_id: string
	[key: string]: unknown
}

class TrackableStore<T extends TrackableData = TrackableData> {
	_id!: string
	[key: string]: unknown

	constructor(data: T) {
		Object.assign(this, data)
	}

	refreshData(this: TrackableStore<T> & T, data: Partial<T>) {
		const self = this as unknown as Record<string, unknown>
		for(const key of Object.keys(data) as Array<keyof T>) {
			const k = key as string
			if(!isEqual(self[k], data[key])) {
				self[k] = data[key]
			}
		}
	}
}

export default TrackableStore
