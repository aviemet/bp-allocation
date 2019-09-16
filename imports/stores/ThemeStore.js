import { action, extendObservable } from 'mobx';

class ThemeStore {
	constructor(theme) {
		// Make all fields on the Theme object observable
		extendObservable(this, {
			...theme
		});
	}

	// Used by root store to udpate values from DB changes
	@action
	refreshTheme(theme) {
		for(let [ key, value ] of Object.entries(theme)) {
			this[key] = value;
		}
	}
}

export default ThemeStore;