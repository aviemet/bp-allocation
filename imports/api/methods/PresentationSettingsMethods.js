import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { PresentationSettings } from '/imports/api/db';

const PresentationSettingsMethods = {
	/**
	 * Create Settings
	 */
	create: new ValidatedMethod({
		name: 'settings.create',

		validate: null,

		run() {
			return PresentationSettings.insert({});
		}
	}),

	/**
	 * Update Setting(s)
	 */
	update: new ValidatedMethod({
		name: 'settings.update',

		validate: null,

		run({ id, data }) {
			return PresentationSettings.update({ _id: id }, { $set: data });
		}
	}),

};

export default PresentationSettingsMethods;
