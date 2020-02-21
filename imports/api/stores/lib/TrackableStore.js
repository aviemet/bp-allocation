import { action, extendObservable } from 'mobx';
import { isEqual } from 'lodash';

class TrackableStore {
	constructor(data) {
		// Make all fields on the object observable
		extendObservable(this, {
			...data
		});
	}

	// Used by root store to udpate values from DB changes
	@action
	refreshData(data) {
		for(let [ key, value ] of Object.entries(data)) {
			if(!isEqual(this[key], value)) {
				this[key] = value;
			}
		}
	}
}

export default TrackableStore;