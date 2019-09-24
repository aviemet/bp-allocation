import { action, extendObservable } from 'mobx';

class TrackableStore {
	constructor(data, parent) {
		this.parent = parent;
		// Make all fields on the object observable
		extendObservable(this, {
			...data
		});
	}

	// Used by root store to udpate values from DB changes
	@action
	refreshData(data) {
		// TODO: Error checking? Can only update existing fields maybe?
		for(let [ key, value ] of Object.entries(data)) {
			this[key] = value;
		}
	}
}

export default TrackableStore;