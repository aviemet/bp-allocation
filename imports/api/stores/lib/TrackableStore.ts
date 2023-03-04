import { action, extendObservable, makeObservable } from 'mobx'

abstract class TrackableStore<C extends BaseCollection> {
	constructor(data: { [key in keyof C]?: C[key] }) {
		Object.assign(this, data)

		makeObservable(this, {
			refreshData: action,
		})

		// Make all fields on the object observable
		extendObservable(this, { ...data })
	}

	// Used by root store to update values from DB changes
	refreshData(data: { [key in keyof C]?: C[key] }) {
		Object.assign(this, data)
	}

}

export default TrackableStore
