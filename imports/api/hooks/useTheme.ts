import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import { Themes } from "../db"
import { useData } from "../providers/DataProvider"
import { initializeThemeData } from "../stores/ThemeStore"

export const useTheme = () => {
	const data = useData()
	const themeId = data?.themeId

	return useTracker(() => {
		if(!themeId) {
			return {
				theme: undefined,
				themeLoading: true,
			}
		}

		const subscription = Meteor.subscribe("theme", themeId)
		const subscriptionReady = subscription.ready()
		const themeData = Themes.findOne({ _id: themeId })

		if(!subscriptionReady || !themeData) {
			return {
				theme: undefined,
				themeLoading: !subscriptionReady,
			}
		}

		const initializedTheme = initializeThemeData(themeData)

		return {
			theme: initializedTheme,
			themeLoading: false,
		}
	}, [themeId])
}

