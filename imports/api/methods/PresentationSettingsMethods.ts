import { ValidatedMethod } from "meteor/mdg:validated-method"

import { PresentationSettings, type SettingsData } from "/imports/api/db"

const PresentationSettingsMethods = {
	/**
	 * Create Settings
	 */
	create: new ValidatedMethod({
		name: "settings.create",

		validate: null,

		async run() {
			return await PresentationSettings.insertAsync({})
		},
	}),

	/**
	 * Update Setting(s)
	 */
	update: new ValidatedMethod({
		name: "settings.update",

		validate: null,

		async run({ id, data }: { id: string, data: Partial<SettingsData> }) {
			return await PresentationSettings.updateAsync({ _id: id }, { $set: data })
		},
	}),

}

export default PresentationSettingsMethods
