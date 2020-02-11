import TrackableCollection from './lib/TrackableCollection';
import { computed } from 'mobx';
import { sortBy } from 'lodash';

class OrgsCollection extends TrackableCollection {

	// Cache list of pre-existing pledges to prevent animating stale data
	constructor(data, parent, Store) {
		super(data, parent, Store);

		this.values.forEach(org => {
			org.pledges.forEach(pledge => {
				this.parent.displayedPledges.add(pledge._id);
			});
		});
	}

	// Filter the top orgs for the theme, adding computed values
	@computed
	get topOrgs() {
		// Discover the number of top orgs for this theme
		const theme = this.parent.theme;
		const slice = theme.numTopOrgs >= theme.topOrgsManual.length ? theme.numTopOrgs : theme.topOrgsManual.length;

		// Sort orgs by total chit votes
		return this.sortTopOrgs.slice(0, slice);
	}

	/**
	 * Return all orgs sorted by votes
	 */
	@computed
	get sortTopOrgs() {
		const theme = this.parent.theme;

		// Save manual top orgs as key/value true/false pairs for reference
		let manualTopOrgs = {};
		theme.topOrgsManual.map((org) => {
			manualTopOrgs[org] = true;
		});

		// First sort orgs by weight and vote count
		let sortedOrgs = sortBy(this.values, org => {
			// Sort in descending order
			return -(org.votes);
		});

		//Then bubble up the manual top orgs
		// No need to proceed if manual orgs is >= numTopOrgs
		if(theme.numTopOrgs >= theme.topOrgsManual.length){
			// climb up the bottom of the list looking for manually selected orgs
			for(let i = sortedOrgs.length - 1; i >= theme.numTopOrgs; i--){

				// Check if the org has been manually selected
				if(manualTopOrgs[sortedOrgs[i]._id]){
					// Find the closest automatically selected top org
					let j = i - 1;
					while(j > 0 && manualTopOrgs[sortedOrgs[j]._id]){
						j--;
					}

					// Start swapping the auto top org down the list
					while(j < i){
						let tmp = sortedOrgs[i];
						sortedOrgs[i] = sortedOrgs[j];
						sortedOrgs[j] = tmp;

						j++;
					}

					// Send the index back one in case we swapped another match into previous place
					i++;
				}
			}
		}

		return sortedOrgs;
	}

	/**
	 * Whether top orgs have been chosen yet
	 */
	@computed
	get topOrgsChosen() {
		return !this.values.some(org => {
			if(org.chitVotes.count <= 0 && org.chitVotes.weight <= 0) {
				return true;
			}
		});
	}

	/**
	 * Queue for displaying pledges on screen
	 */
	@computed
	get pledges() {
		let pledges = [];
		this.topOrgs.map(org => {
			org.pledges.map(pledge => {
				pledges.push(Object.assign({
					org: {
						_id: org._id,
						title: org.title
					}
				}, pledge));
			});
		});
		pledges = sortBy(pledges, ['createdAt']);
		return pledges;
	}
}

export default OrgsCollection;