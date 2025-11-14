import { ValidatedMethod } from "meteor/mdg:validated-method"

import { Images } from "/imports/api/db"

const ImageMethods = {
	remove: new ValidatedMethod<{ id: string }, void>({
		name: "images.remove",

		validate: null,

		async run({ id }) {
			await Images.collection.removeAsync({ _id: id })
		},
	}),

	removeMany: new ValidatedMethod<{ ids: string[] }, void>({
		name: "images.removeMany",

		validate: null,

		async run({ ids }) {
			await Images.collection.removeAsync({ _id: { $in: ids } })
		},
	}),

	rename: new ValidatedMethod<{ id: string, name: string }, void>({
		name: "images.rename",

		validate: null,

		run() {

		},
	}),
}

export default ImageMethods
