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
		}
		// TODO: return error
	});

	Meteor.publish('image', (id) =>  {
		if(!id) return false;

		return Images.find({_id: id}).cursor;
	});

  Meteor.publish('images', (ids) => {
  	if(!ids) return false;

    return Images.find({_id: {$in: ids}}).cursor;
  });

  Meteor.publish('images.byTheme', function(themeId) {
  	if(themeId){
	  	let orgs = Organizations.find({theme: themeId}, {_id: true, image: true}).fetch();

	  	let imgIds = [];
	  	orgs.map((org, i) => {
	  		imgIds.push(org.image);
	  	});

	    return Images.find({_id: {$in: imgIds}}).cursor;
	  }
	  return Images.find({}).cursor;
  });

});
