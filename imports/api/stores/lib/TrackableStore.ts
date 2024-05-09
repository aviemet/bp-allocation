import { action, extendObservable, makeObservable } from 'mobx'

class TrackableStore<C extends BaseCollection> {
	_id: string

	constructor(data: { [key in keyof C]?: C[key] }) {
		// To satisfy typescript, it needs to think this will always be a string
		// This is fine because passed objects will always be fetched from MongoDB, and thus will always have an id
		this._id = data._id ?? ''

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
