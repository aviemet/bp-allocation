import { Meteor } from 'meteor/meteor';

import { Images, Organizations } from '/imports/api/db';

// Images - Images by [id]
Meteor.publish('images', (ids) => {
	if(!ids) return false;

	return Images.find({ _id: { $in: ids } }).cursor; // Images need the cursor
});

// Images - All images for theme
Meteor.publish('images.byTheme', function(themeId) {
	if(!themeId) return Images.find({}).cursor;

	let orgs = Organizations.find({ theme: themeId }, { _id: true, image: true }).fetch();

	let imgIds = [];
	orgs.map((org, i) => {
		imgIds.push(org.image);
	});

	return Images.find({ _id: { $in: imgIds } }).cursor; // Images need the cursor
});

// Image - Single Image
Meteor.publish('image', (id) =>  {
	if(!id) return false;

	return Images.find({ _id: id }).cursor; // Images need the cursor
});