import TrackableCollection from './TrackableCollection';
import { observable, computed } from 'mobx';
import { filterCollection } from '/imports/lib/utils';

class MembersCollection extends TrackableCollection {
	@observable searchFilter;

	@computed
	get filteredMembers() {
		if(!this.searchFilter) return this.values;

		// We're only searching a subset of the fields present on Member
		const checkFields = ['firstName', 'lastName', 'fullName', 'code', 'initials', 'number', 'phone'];
		return filterCollection(this.values, this.searchFilter, checkFields);

	}
}

export default MembersCollection;