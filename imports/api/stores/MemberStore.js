import { computed, extendObservable } from 'mobx';

class MemberStore {
	constructor(member, parent) {
		this.parent = parent;

		// Make all fields on the object observable
		extendObservable(this, {
			...member
		});
	}

	@computed
	get formattedName() {
		if(this.fullName) return this.fullName;
		return `${this.firstName} ${this.lastName}`;
	}
}

export default MemberStore;