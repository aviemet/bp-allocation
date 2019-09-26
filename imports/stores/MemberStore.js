import { computed, toJS, observable, extendObservable } from 'mobx';
import { filterTopOrgs, roundFloat } from '/imports/utils';
import _ from 'lodash';

class MemberStore {
	constructor(member, parent) {
		this.parent = parent;

		// Make all fields on the object observable
		extendObservable(this, {
			...member
		});
	}

	@computed
	get theme() {
		const theme = this.parent.theme._id;
		const member = this._id;
		
		return _.find(this.parent.memberThemes.values, value => value.theme === theme && value.member === member);
	}
}

export default MemberStore;