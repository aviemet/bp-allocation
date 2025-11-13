import { findIndex, remove, orderBy, isEqual } from "lodash"

import { filterCollection } from "/imports/lib/utils"
import TrackableStore, { TrackableData } from "./TrackableStore"

class TrackableCollection<T extends TrackableStore<TrackableData> = TrackableStore> {
	values: T[] = []
	searchFilter: string | null = null
	searchableFields: string[] | null = null
	private _store: (new (data: any) => T) | null = null

	constructor(data: TrackableData[], Store: (new (data: any) => T) | null = null) {
		this._store = Store

		if(Store) {
			this.values = data.map(value => {
				const store = new Store(value)
				return store
			})
		} else {
			this.values = data as T[]
		}
	}

	refreshData(data: TrackableData) {
		let i = findIndex(this.values, value => value._id === data._id )
		if(i >= 0) {
			// Update values
			for(let [ key, value ] of Object.entries(data)) {
				if(!isEqual((this.values[i])[key], value)) {
					(this.values[i] as any)[key] = value
				}
			}
		} else {
			// Add values
			const newElement = this._store ? new this._store(data) : data as T
			this.values.push(newElement)
		}
	}

	deleteItem(data: TrackableData | string) {
		const id = typeof data === "string" ? data : data._id
		remove(this.values, value => value._id === id)
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
