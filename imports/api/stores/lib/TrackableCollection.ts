import { findIndex, remove, orderBy, isEqual } from "lodash"
import { action, observable, computed, makeObservable } from "mobx"

import { filterCollection } from "/imports/lib/utils"
import TrackableStore, { TrackableData } from "./TrackableStore"

class TrackableCollection<T extends TrackableStore<TrackableData> = TrackableStore> {
	values: T[] = []
	searchFilter: string | null = null
	// Override with String array of field names to search against in collection filter
	searchableFields: string[] | null = null
	private _store: (new (data: any) => T) | null = null

	/**
	 * @param data Array of data to be stored in the collection
	 * @param Store Mobx Store object for data being stored
	 */
	constructor(data: TrackableData[], Store: (new (data: any) => T) | null = null) {
		this._store = Store

		// If a Store was provided, instantiate a new store for each element in data
		// Either the Store object, or the raw data variable gets stored as the values for the collection
		if(Store) {
			this.values = data.map(value => {
				const store = new Store(value)
				return store
			})
		} else {
			this.values = data as T[]
		}

		makeObservable(this, {
			values: observable,
			searchFilter: observable,
			refreshData: action,
			deleteItem: action,
			sortBy: action,
			reverse: action,
			filteredMembers: computed,
		})
	}

	refreshData(data: TrackableData) {
		let i = findIndex(this.values, value => value._id === data._id )
		if(i >= 0) {
			// Update values
			for(let [ key, value ] of Object.entries(data)) {
				if(!isEqual((this.values[i] as any)[key], value)) {
					(this.values[i] as any)[key] = value
				}
			}
		} else {
			// Add values
			const newElement = this._store ? new this._store(data) : data as T
			this.values.push(newElement)
		}
	}

	deleteItem(data: TrackableData) {
		remove(this.values, value => value._id === data._id)
	}

	sortBy(column: string, direction: "ascending" | "descending" | "asc" | "desc") {
		const dir = ({ ascending: "asc", asc: "asc", descending: "desc", desc: "desc" } as const)[direction]

		this.values = orderBy(this.values, column, dir)
	}

	reverse() {
		this.values.reverse()
	}

	get filteredMembers(): T[] {
		if(!this.searchFilter) return this.values

		return filterCollection(this.values, this.searchFilter, this.searchableFields || undefined)
	}
}

export default TrackableCollection
