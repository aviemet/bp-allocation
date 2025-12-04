import { Meteor } from "meteor/meteor"
import { FilesCollection } from "meteor/ostrio:files"
import { type FilesCollectionConfig, type FileData } from "meteor/ostrio:files"

let config: FilesCollectionConfig = {
	collectionName: "images",
	downloadRoute: "/uploads/",
	public: true,
	allowClientCode: true,
}

if(Meteor.isServer) {
	const fs = require("fs")
	const path = require("path")
	const storagePath = path.resolve(process.env.PWD || process.cwd(), ".uploads")

	if(!fs.existsSync(storagePath)) {
		fs.mkdirSync(storagePath, { recursive: true })
	}

	config = {
		...config,
		storagePath: storagePath,
		onBeforeUpload: (file: FileData) => {
			const extension = file.extension || (file.name ? file.name.split(".").pop()?.toLowerCase() : "")

			if(!extension) {
				return "File must have an extension"
			}

			if(!/png|jpg|jpeg|gif/i.test(extension)) {
				return "Please upload an image file (png, jpg, jpeg, or gif)"
			}

			if(file.size > 20971520) {
				return "Please upload image, with size equal or less than 20MB"
			}


			return true
		},
	}
}

const Images = new FilesCollection(config)

if(Meteor.isServer) {
	Images.allow({
		insert: () => true,
		update: () => true,
		remove: () => true,
	})
}

export { Images }
