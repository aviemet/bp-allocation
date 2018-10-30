import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';

import { Themes, Organizations, Images } from '/imports/api';

const ImageMethods = {
	remove: new ValidatedMethod({
		name: 'images.remove',

		validate: null,

		run(id) {
			Images.collection.remove({_id: id});
		}
	}),

	removeMany: new ValidatedMethod({
		name: 'images.removeMany',

		validate: null,

		run(ids) {
			Images.collection.remove({_id: {$in: ids}});
		}
	}),

	rename: new ValidatedMethod({
		name: 'images.rename',

		validate: null,

		run(id, name){

		}
	})
}

export default ImageMethods;
