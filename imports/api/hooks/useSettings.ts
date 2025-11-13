import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import { useData } from "../providers/DataProvider"
import { PresentationSettings, type SettingsData } from "../db"

export const useSettings = () => {
	const data = useData()
	const themeId = data?.themeId

	return useTracker(() => {
		if(!themeId) {
			return {
				settings: undefined,
				settingsLoading: true,
			}
		}

		const subscription = Meteor.subscribe("settings", themeId)
		const subscriptionReady = subscription.ready()
		const settingsData = PresentationSettings.findOne()

		if(!subscriptionReady || !settingsData) {
			return {
				settings: undefined,
				settingsLoading: !subscriptionReady,
			}
		}

		return {
			settings: settingsData,
			settingsLoading: false,
		}
	}, [themeId])
}

