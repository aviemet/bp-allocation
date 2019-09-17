import { action, observable } from 'mobx';
import _ from 'lodash';

class TrackableCollection {
	@observable values = [];
	constructor(data) {
		this.values = data;
	}

	@action
	refreshData(data) {
		let i = _.find(this.data, value => value._id === data._id );
		// TODO: Error checking? Can only update existing fields maybe?
		this.values[i] = data;
	}
}

export default TrackableCollection;