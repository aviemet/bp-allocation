import _ from 'lodash';

const COLORS = ["#6D35A4", "#E1333E", "#02D3BE", "#18C64D", "#D89111", "#01B0FF"];

const KIOSK_PAGES = { info: 'info', chit: 'chit', funds: 'funds' };

const roundFloat = (value, decimal) => {
	decimal = decimal || 2;
	return parseFloat(parseFloat(value).toFixed(decimal));
};

const getSaveAmount = (saves, org_id) => {
	let save = saves.find( save => save.org === org_id);
	return save ? save.amount : 0;
}

/**
 * Return all orgs sorted by votes
 */
sortTopOrgs = (theme, orgs) => {
	if(!theme){
		throw new Meteor.Error("No theme provided to ThemeMethods.filterTopOrgs");
		return;
	}

	// Save manual top orgs as key/value true/false pairs for reference
	let manualTopOrgs = {};
	theme.topOrgsManual.map((org) => {
		manualTopOrgs[org] = true;
	});

	// First sort orgs by weight and vote count
	let sortedOrgs = _.sortBy(orgs, (org) => {
		// Calculate the votes for each org (weight/chitWeight unless there's a manual count)
		let votes = org.chitVotes && org.chitVotes.count ? org.chitVotes.count :
								org.chitVotes && org.chitVotes.weight ? org.chitVotes.weight / theme.chitWeight : 0;

		// Save the votes count for later
		org.votes = votes;

		// Sort in descending order
		return -(votes)
	});

	//Then bubble up the manual top orgs
	// No need to proceed if manual orgs is >= numTopOrgs
	if(theme.numTopOrgs >= theme.topOrgsManual.length){
		slice = theme.numTopOrgs;

		// climb up the bottom of the list looking for manually selected orgs
		for(let i = sortedOrgs.length-1; i >= theme.numTopOrgs; i--){

			// Check if the org has been manually selected
			if(manualTopOrgs[sortedOrgs[i]._id]){
				// Find the closest automatically selected top org
				let j = i-1;
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

/**
 * Get Top Orgs Sorted by chit votes
 */
filterTopOrgs = (theme, orgs) => {
	slice = theme.numTopOrgs >= theme.topOrgsManual.length ? theme.numTopOrgs : theme.topOrgsManual.length;

	let sortedOrgs = this.sortTopOrgs(theme, orgs);

	return sortedOrgs.slice(0, slice);
};

export { COLORS, KIOSK_PAGES, roundFloat, getSaveAmount, sortTopOrgs, filterTopOrgs };
