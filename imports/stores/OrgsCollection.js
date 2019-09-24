import TrackableCollection from './TrackableCollection';
import { computed, toJS } from 'mobx';
import { filterTopOrgs, roundFloat } from '/imports/utils';
import _ from 'lodash';

class OrgsStore extends TrackableCollection {
	// Filter the top orgs for the theme, adding computed values
	@computed
	get topOrgs() {
		var parent = this.parent;

		return filterTopOrgs(parent.theme, this.values);
	}
}

export default OrgsStore;