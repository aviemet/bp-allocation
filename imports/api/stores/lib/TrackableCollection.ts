import { action, observable, computed, makeObservable } from 'mobx'
import { findIndex, remove, orderBy } from 'lodash'
import TrackableStore from './TrackableStore'

abstract class TrackableCollection<C extends BaseCollection> {
	values: TrackableStore<C>[] = []
	searchFilter: string = ''
	// Override with String array of field names to search against in collection filter
	searchableFields: (keyof C)[] | null = null

	_store

	/**
	 * @param {Array} data Array of data to be stored in the collection
	 * @param {Object} Store Mobx Store object for data being stored
	 */
	constructor(data: C[], Store: typeof TrackableStore<C>) {
		this._store = Store

		this.values = data.map(datum => {
			const store = new Store(datum)
			return store
		})

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
			this.values[i].refreshData(data)
		} else {
			this.values.push(new this._store(data))
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

		// Split search terms by whitespace, discarding empty strings
		const searchParts = this.searchFilter.split(/\s+/).filter(part => part.length > 0)
		const checkFields = this.searchableFields || Object.keys(this.values[0])

		return this.values.filter(member => searchParts.every(word => {
			const test = new RegExp(word, 'i')

			return checkFields.some(field => {
				// @ts-ignore: Type 'keyof C' cannot be used to index type 'TrackableStore<C>'
				if(test.test(member[field])) {
					return true
				}
			})
		}))
	}

	clearSearchFilter() {
		this.searchFilter = ''
	}
}

export default TrackableCollection
