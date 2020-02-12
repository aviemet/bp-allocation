import { computed, extendObservable } from 'mobx';
import { roundFloat } from '/imports/lib/utils';
import _ from 'lodash';

class OrgStore {
	constructor(org, parent) {
		this.parent = parent;

		// Make all fields on the object observable
		extendObservable(this, {
			...org
		});
	}
}

export default OrgStore;