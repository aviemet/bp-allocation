import { extendObservable } from 'mobx';

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