import { computed, toJS, observable, extendObservable, action, autorun } from 'mobx';
import { filterTopOrgs, roundFloat } from '/imports/utils';
import _ from 'lodash';

class MemberThemeStore {
	constructor(memberTheme, parent) {
		this.parent = parent;

		// Make all fields on the object observable
		extendObservable(this, {
			...memberTheme
		});
	}
}

export default MemberThemeStore;