import { action, observable, computed, makeObservable } from 'mobx'
import { filterCollection } from '/imports/lib/utils'
import { findIndex, remove, orderBy, isEqual } from 'lodash'
import TrackableStore from './TrackableStore'

class TrackableCollection<C extends BaseCollection> {
	values: TrackableStore<C>[] = []
	searchFilter: string = ''
	// Override with String array of field names to search against in collection filter
	searchableFields: string[] | null = null

	_store

	/**
	 * @param {Array} data Array of data to be stored in the collection
	 * @param {Object} Store Mobx Store object for data being stored
	 */
	constructor(data: C[], Store: TrackableStore<C>) {
		this._store = Store

		// If a Store was provided, instantiate a new store for each element in data
		// Either the Store object, or the raw data variable gets stored as the values for the collection
		if(Store) {
			this.values = data.map(value => {
				const store = new Store<C>(value)
				return store
			})
		} else {
			this.values = data
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

	refreshData(data: C) {
		let i = findIndex(this.values, value => value._id === data._id)

		if(i >= 0) {
			// Update values
			for(let [key, value] of Object.entries(data)) {
				if(!isEqual(this.values[i][key], value)) {
					this.values[i][key] = value
				}
			}
		} else {
			// Add values
			const newElement = this._store ? new this._store(data) : data
			this.values.push(newElement)
		}
	}

	deleteItem(data: C) {
		remove(this.values, value => value._id === data._id)
	}

	sortBy(column: string, direction: 'ascending' | 'descending') {
		let dir: boolean | 'asc' | 'desc' | undefined

		switch (direction) {
			case 'ascending':
				dir = 'asc'
				break
			case 'descending':
				dir = 'desc'
				break
			default:
				dir = direction
		}

		this.values = orderBy(this.values, column, dir)
	}

	reverse() {
		this.values.reverse()
	}

	get filteredMembers() {
		if(!this.searchFilter) return this.values

		return filterCollection(this.values, this.searchFilter, this.searchableFields)
	}
}

export default TrackableCollection
