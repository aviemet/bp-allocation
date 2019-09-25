import { action, observable } from 'mobx';
import _ from 'lodash';

class TrackableCollection {
	@observable values = [];

	constructor(data, parent, Store) {
		this._store = Store;
		this.parent = parent;
		
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
		// console.log({ data });
		let i = _.findIndex(this.values, value => value._id === data._id );
		if(i >= 0) {
			// console.log('Update values');
			for(let [ key, value ] of Object.entries(data)) {
				if(this.values[i][key] !== value) {
					this.values[i][key] = value;
				}
			}
		} else {
			// console.log('Add values');
			const newElement = this._store ? new this._store(data, parent) : data;
			this.values.push(newElement);
		}
	}

	@action
	deleteItem(data) {
		let i = _.findIndex(this.values, value => value._id === data._id );

		this.values = _.pullAt(this.values, i);
	}
}

export default TrackableCollection;