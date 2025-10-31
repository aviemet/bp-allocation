import { Meteor } from "meteor/meteor"

import { Images, Organizations } from "/imports/api/db"

// Images - Images by [id]
Meteor.publish("images", (ids) => {
	if(!ids) return false

	return Images.find({ _id: { $in: ids } }).cursor
})

// Images - All images for theme
Meteor.publish("images.byTheme", async function(themeId) {
	if(!themeId) return Images.find({}).cursor

	const orgs = await Organizations.find({ theme: themeId }).fetchAsync()

	const imgIds: string[] = []
	orgs.forEach((org) => {
		if(org.image) {
			imgIds.push(org.image)
		}
	})

	return Images.find({ _id: { $in: imgIds } }).cursor
})

// Image - Single Image
Meteor.publish("image", (id) => {
	if(!id) return false

	return Images.find({ _id: id }).cursor
})
