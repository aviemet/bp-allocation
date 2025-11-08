import { isEqual } from "lodash"
import { action, extendObservable, makeObservable } from "mobx"

export type TrackableData<T extends Record<string, unknown> = Record<string, unknown>> = T & {
	readonly _id: string
}

class TrackableStore<T extends TrackableData = TrackableData> {
	readonly _id!: string
	[key: string]: unknown

	constructor(data: T) {
		makeObservable(this, {
			refreshData: action,
		})

		// Make all fields on the object observable
		extendObservable(this, {
			...data,
		})
	}

	// Used by root store to update values from DB changes
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
