import { action, observable } from 'mobx';
import _ from 'lodash';

class TrackableCollection {
	@observable values = [];

	constructor(data, parent, Store) {
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
		let i = _.findIndex(this.values, value => value._id === data._id );
		for(let [ key, value ] of Object.entries(data)) {
			if(this.values[i][key] !== value) {
				this.values[i][key] = value;
			}
		}
	}
}

export default TrackableCollection;