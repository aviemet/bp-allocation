import TrackableStore from './TrackableStore';
import { observable, computed, action } from 'mobx';
import { ThemeMethods } from '/imports/api/methods';

class ThemeStore extends TrackableStore {
	@action
	setTitle(value) {
		this.title = value;
		this.dbUpdate({ title: value });
	}

	dbUpdate(data) {
		return ThemeMethods.update.call({ id: this._id, data });
	}
}

export default ThemeStore;