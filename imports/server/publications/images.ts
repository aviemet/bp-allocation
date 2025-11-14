import { Meteor } from "meteor/meteor"
import { type FileData } from "meteor/ostrio:files"

import { Images, Organizations } from "/imports/api/db"

Meteor.publish("images", async function(ids: string[]) {
	if(!ids) {
		this.ready()
		return
	}

	const images = await Images.find({ _id: { $in: ids } }).fetchAsync()
	images.forEach(image => {
		this.added("images", image._id as string, image as unknown as Record<string, unknown>)
	})

	const observer = Images.find({ _id: { $in: ids } }).observe({
		added: (doc) => {
			this.added("images", doc._id as string, doc as unknown as Record<string, unknown>)
		},
		changed: (doc) => {
			this.changed("images", doc._id as string, doc as unknown as Record<string, unknown>)
		},
		removed: (doc) => {
			this.removed("images", doc._id as string)
		},
	})

	this.onStop(() => {
		if(observer && typeof observer.stop === "function") {
			observer.stop()
		}
	})
	this.ready()
})

Meteor.publish("images.byTheme", async function(themeId: string) {
	const imgIds: string[] = []

	if(themeId) {
		const orgs = await Organizations.find({ theme: themeId }).fetchAsync()
		orgs.forEach((org) => {
			if(org.image) {
				imgIds.push(org.image)
			}
		})
	}

	const images = await Images.find({ _id: { $in: imgIds } }).fetchAsync()
	images.forEach(image => {
		this.added("images", image._id as string, image as unknown as Record<string, unknown>)
	})

	const observer = Images.find({ _id: { $in: imgIds } }).observe({
		added: (doc) => {
			this.added("images", doc._id as string, doc as unknown as Record<string, unknown>)
		},
		changed: (doc) => {
			this.changed("images", doc._id as string, doc as unknown as Record<string, unknown>)
		},
		removed: (doc) => {
			this.removed("images", doc._id as string)
		},
	})

	this.onStop(() => {
		if(observer && typeof observer.stop === "function") {
			observer.stop()
		}
	})
	this.ready()
})

Meteor.publish("image", async function(id: string) {
	if(!id) {
		this.ready()
		return
	}

	const image = await (Images.findOneAsync({ _id: id }) as Promise<FileData | undefined>)
	if(image) {
		this.added("images", image._id as string, image as unknown as Record<string, unknown>)
	}

	const observer = Images.find({ _id: id }).observe({
		added: (doc) => {
			this.added("images", doc._id as string, doc as unknown as Record<string, unknown>)
		},
		changed: (doc) => {
			this.changed("images", doc._id as string, doc as unknown as Record<string, unknown>)
		},
		removed: (doc) => {
			this.removed("images", doc._id as string)
		},
	})

	this.onStop(() => {
		if(observer && typeof observer.stop === "function") {
			observer.stop()
		}
	})
	this.ready()
})
