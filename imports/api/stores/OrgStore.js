import { extendObservable } from 'mobx';

class OrgStore {
	constructor(org) {
		// Make all fields on the object observable
		extendObservable(this, {
			...org
		});
	}
}

export default OrgStore;