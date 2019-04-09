import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';

import { Themes, PresentationSettings, Organizations, Images } from '/imports/api';

import '/imports/api/methods';

Meteor.startup(() => {

	Meteor.publish('themes', (themeId) => {
		if(themeId){
			return Themes.find({_id: themeId});
		}
		return Themes.find({});
	});

	Meteor.publish('presentationSettings', (settingsId) => {
		try{
			return PresentationSettings.find({_id: settingsId});
		} catch(e) {
			console.error("Specify an ID to fetch presentation settings");
		}
	});

	Meteor.publish('organizations', (themeId) => {
		if(themeId){
			return Organizations.find({theme: themeId});
		}
		return Organizations.find({});
	});

	Meteor.publish('organization', (orgId) => {
		if(orgId){
			return Organizations.find({_id: orgId});
		}
		// TODO: return error
	});

	Meteor.publish('toporgs', (themeId) => {
		if(themeId){
			let theme = MeteorPromise.await(Themes.find({_id: id})).fetch();
			let orgs = MeteorPromise.await(Organizations.find({theme: id})).fetch();

			/*
			// Save manual top orgs as key/value true/false pairs for reference
			let manualTopOrgs = {};
			theme.topOrgsManual.map((org) => {
				manualTopOrgs[org] = true;
			});

			// First sort orgs by weight and vote count
			let sortedOrgs = _.sortBy(orgs, (org) => {
				// Calculate the votes for each org (weight/chit_weight unless there's a manual count)
				let votes = org.chitVotes.count ? org.chitVotes.count :
											org.chitVotes.weight ? org.chitVotes.weight / theme.chit_weight : 0;

				// Save the votes count for later
				org.votes = votes;

				// Sort in descending order
				return -(votes)
			});

			let slice = theme.topOrgsManual.length;

			//Then bubble up the manual top orgs
			// No need to proceed if manual orgs is >= numTopOrgs
			if(theme.numTopOrgs > theme.topOrgsManual.length){
				slice = theme.numTopOrgs;

				// climb up the bottom of the list looking for manually selected orgs
				for(let i = sortedOrgs.length-1; i >= theme.numTopOrgs; i--){
					// console.log({i: i, num: theme.numTopOrgs});
					// console.log({id: sortedOrgs[i]._id, index: i});
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

			return sortedOrgs.slice(0, slice);
		*/
		}
		// TODO: return error
	});

  Meteor.publish('images', (themeId) => {
  	if(themeId){
	  	let orgs = Organizations.find({theme: themeId}, {_id: true, image: true, title: false, ask: false, theme: false, chitVotes: false, value: false}).fetch();

	  	let imgIds = [];
	  	orgs.map((org, i) => {
	  		imgIds.push(org._id);
	  	});

	    return Images.find({_id: {$in: imgIds}}).cursor;
	  }
	  return Images.find({}).cursor;
  });

});
