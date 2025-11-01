import { ValidatedMethod } from "meteor/mdg:validated-method"

import { Images } from "/imports/api/db"

const ImageMethods = {
	remove: new ValidatedMethod({
		name: "images.remove",

		validate: null,

		async run(id) {
			await Images.collection.removeAsync({ _id: id })
		},
	}),

	removeMany: new ValidatedMethod({
		name: "images.removeMany",

		validate: null,

		async run(ids) {
			await Images.collection.removeAsync({ _id: { $in: ids } })
		},
	}),

	rename: new ValidatedMethod({
		name: "images.rename",

		validate: null,

		run(id, name) {

		},
	}),
}

export default ImageMethods
