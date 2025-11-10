import { Meteor } from "meteor/meteor"

import { Images, Organizations } from "/imports/api/db"

// Images - Images by [id]
Meteor.publish("images", function(ids) {
	if(!ids) {
		this.ready()
		return
	}

	return Images.find({ _id: { $in: ids } })
})

// Images - All images for theme
Meteor.publish("images.byTheme", async function(themeId) {
	if(!themeId) return Images.find({})

	const orgs = await Organizations.find({ theme: themeId }).fetchAsync()

	const imgIds: string[] = []
	orgs.forEach((org) => {
		if(org.image) {
			imgIds.push(org.image)
		}
	})

	return Images.find({ _id: { $in: imgIds } })
})

// Image - Single Image
Meteor.publish("image", function(id) {
	if(!id) {
		this.ready()
		return
	}

	return Images.find({ _id: id })
})
