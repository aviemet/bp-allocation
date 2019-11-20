import TrackableCollection from './TrackableCollection';
import { observable, computed } from 'mobx';

class MembersCollection extends TrackableCollection {
	@observable searchFilter;

	@computed
	get filteredMembers() {
		if(!this.searchFilter) return this.values;

		const searchParts = this.searchFilter.split(/\s+/).filter(part => part.length > 0);
		const checkFields = ['firstName', 'lastName', 'fullName', 'code', 'initials', 'number', 'phone'];

		return this.values.filter(member => {
			let match = false;
			let matcher = new RegExp(searchParts[0], 'i');
			for(let f = 0; f < checkFields.length; f++) {
				match = matcher.test(member[checkFields[f]]);
				// TODO: Figure out the dang filter algo

				// If we get a match on first search term, 
				/*if(match && searchParts.length > 1) {
					let subMatch = searchParts.slice(1).some(part => {
						matcher = new RegExp(part, 'i');
						console.log({ matcher, subTest: matcher.test(member[checkFields[f]]), value: member[checkFields[f]] });
						if(matcher.test(member[checkFields[f]])) {
							return true;
						}
					});
					match = subMatch;
				}*/
				return match;
			}
			return false;
		});


		// eslint-disable-next-line no-unreachable
		return this.values.filter(member => {
			let match = false;
			// Look for a match in each member field
			for(let f = 0; f < checkFields.length; f++) {
				// Check first search term for a match
				let matcher = new RegExp(searchParts[0], 'i');
				match = matcher.test(member[checkFields[f]]);
				if(match && searchParts.length > 1) {
					// console.log({ match, field: checkFields[f], value: member[checkFields[f]] });
					// let subSearchMatch = false;
					match = searchParts.slice(1).some(part => {
						matcher = new RegExp(part, 'i');
						console.log({ matcher, subTest: matcher.test(member[checkFields[f]]), value: member[checkFields[f]] });
						return matcher.test(member[checkFields[f]]);
					});
					
					// If first search term matches, use subsequent terms to further filter results
					/*for(let s = 1; s < searchParts.length; s++) {
						// For each subsequent search term, look for a match in any field
						matcher = new RegExp(searchParts[s], 'i');
						const subTest = matcher.test(member[checkFields[f]]);
						if(subTest) {
							subSearchMatch = true;
						}
					}*/
				}
				// console.log({ match });
				return match;
			}
			console.log('\n');
		});
	}
}

export default MembersCollection;

/*
search each word separately
search all searchable fields 

subsequent search words should narrow results
	only search results filtered by first search term


members.filter
	if member search term matches a field
		search other member fields for subsequent search term matches


*/