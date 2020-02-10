import _ from 'underscore';

// Sets Meteor publication callback events to transform data
export const registerObserver = transformer => (title, self) => {
	return {
		added: doc => {
			return self.added(title, doc._id, transformer(doc));
		},
		changed: (newDoc, oldDoc) => {
			return self.changed(title, newDoc._id, transformer(newDoc));
		},
		removed: oldDoc => {
			return self.removed(title, oldDoc._id);
		}
	};
};

// Returns the number of top orgs in the theme
export const getNumTopOrgs = theme => theme.numTopOrgs >= theme.topOrgsManual.length ? theme.numTopOrgs : theme.topOrgsManual.length;

// Returns the top orgs after the first round of chit voting
export const filterTopOrgs = (orgs, theme) => {
	// Save manual top orgs as key/value true/false pairs for reference
	let manualTopOrgs = {};
	theme.topOrgsManual.map((org) => {
		manualTopOrgs[org] = true;
	});

	// First sort orgs by weight and vote count
	let sortedOrgs = _.sortBy(orgs, org => {
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
};