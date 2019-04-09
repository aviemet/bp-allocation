import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';

import { Promise } from 'meteor/promise';

import { PresentationSettings, Organizations } from '/imports/api';
import { PresentationSettingsSchema }  from '/imports/api/schema';

import _ from 'lodash';


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

		run({id, data}) {
			return PresentationSettings.update({_id: id}, {$set: data});
		}
	}),

}

export default PresentationSettingsMethods;
