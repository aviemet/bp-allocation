import { action, observable, computed } from 'mobx';
import { filterCollection } from '/imports/lib/utils';
import _ from 'lodash';

class TrackableCollection {
	@observable values = [];
	@observable searchFilter;
	// Override with String array of field names to search against in collection filter
	searchableFields = null;

	/**
	 * 
	 * @param {Array} data Array of data to be stored in the collection
	 * @param {Object} parent Reference to parent object
	 * @param {Object} Store Mobx Store object for data being stored
	 */
	constructor(data, parent, Store) {
		this._store = Store;
		this.parent = parent;
		
		// If a Store was provided, instantiate a new store for each element in data
		// Either the Store object, or the raw data variable gets stored as the values for the collection
		if(Store) {
			const tmp = data.map(value => { 
				const store = new Store(value, parent); 
				return store;
			});
			this.values = tmp;
		} else {
			this.values = data;
		}
	}

	@action
	refreshData(data) {
		let i = _.findIndex(this.values, value => value._id === data._id );
		if(i >= 0) {
			// Update values
			for(let [ key, value ] of Object.entries(data)) {
				if(this.values[i][key] !== value) {
					this.values[i][key] = value;
				}
			}
		} else {
			// Add values
			const newElement = this._store ? new this._store(data, this.parent) : data;
			this.values.push(newElement);
		}
	}

	@action
	deleteItem(data) {
		_.remove(this.values, value => value._id === data._id);
	}

	@action
	sortBy(column, direction) {
		let dir;
		switch(direction) {
			case 'ascending':
				dir = 'asc';
				break;
			case 'descending':
				dir = 'desc';
				break;
			default:
				dir = direction; 
		}

		this.values = _.orderBy(this.values, column, dir);
	}

	@action
	reverse() {
		this.values.reverse();
	}

	@computed
	get filteredMembers() {
		if(!this.searchFilter) return this.values;

		return filterCollection(this.values, this.searchFilter, this.searchableFields);
	}
}

export default TrackableCollection;