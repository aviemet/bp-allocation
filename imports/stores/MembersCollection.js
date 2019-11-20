import TrackableCollection from './TrackableCollection';
import { observable, computed } from 'mobx';

class MembersCollection extends TrackableCollection {
	@observable searchFilter;

	@computed
	get filteredMembers() {
		if(!this.searchFilter) return this.values;

		const searchParts = this.searchFilter.split(' ');
		const checkFields = ['firstName', 'lastName', 'fullName', 'code', 'initials', 'number', 'phone'];

		console.log({ searchParts });

		return this.values.filter(member => {
			for(let s = 0; s < searchParts.length; s++) {
				const matcher = new RegExp(searchParts[s], 'i');

				for(let f = 0; f < checkFields.length; f++) {
					if(matcher.test(member[checkFields[f]])) {
						return true;
					}
				}
			}
		});
	}
}

export default MembersCollection;