import { isEqual } from "lodash"
import { action, extendObservable, makeObservable } from "mobx"

export interface TrackableData {
	_id: string
	[key: string]: unknown
}

class TrackableStore<T extends TrackableData = TrackableData> {
	_id!: string
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

	// Used by root store to udpate values from DB changes
	refreshData(data: T) {
		for(let [ key, value ] of Object.entries(data)) {
			if(!isEqual(this[key], value)) {
				this[key] = value
			}
		}
	}
}

// Helper type to create a store that has the properties of T
export type TrackableStoreWithData<T extends TrackableData> = TrackableStore<T> & T

export default TrackableStore
