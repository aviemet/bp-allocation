import { Meteor } from "meteor/meteor"
import { FilesCollection } from "meteor/ostrio:files"
import { type FilesCollectionConfig, type FileData } from "meteor/ostrio:files"

const config: FilesCollectionConfig = {
	collectionName: "images",
	allowClientCode: true,
	downloadRoute: "/uploads/",
	public: true,
	onBeforeUpload(file: FileData) {
		if(file.size <= 20971520 && /png|jpg|jpeg|gif/i.test(file.extension)) {
			return true
		}
		return "Please upload image, with size equal or less than 20MB"
	},
}

if(Meteor.isServer) {
	config.storagePath = process.env.PWD + "/public/.uploads"
}

const Images = new FilesCollection(config)

// Images.attachSchema(FilesCollection.schema)

if(Meteor.isServer) {
	/* Allow all
	 * @see http://docs.meteor.com/#/full/allow
	 */
	Images.allowClient()

	/* Allow per action
	 * @see http://docs.meteor.com/#/full/allow
	 */
	// Images.allow({
	//   insert: function() {
	//     return true
	//   },
	//   update: function() {
	//     return true
	//   },
	//   remove: function() {
	//     return true
	//   }
	// })
}

export { Images }
