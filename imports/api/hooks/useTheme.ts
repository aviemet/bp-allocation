import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import { type ThemeWithComputed } from "/imports/server/transformers/themeTransformer"
import { Themes, type ThemeData } from "../db"
import { useData } from "../providers/DataProvider"

export const useTheme = () => {
	const data = useData()
	const themeId = data?.themeId

	return useTracker((): {
		theme: (Pick<ThemeWithComputed, '_id'> & Partial<Omit<ThemeWithComputed, '_id'>>) | undefined
		themeLoading: boolean
	} => {
		if(!themeId) {
			return {
				theme: undefined,
				themeLoading: true,
			}
		}

		const subscription = Meteor.subscribe("theme", themeId)
		const subscriptionReady = subscription.ready()
		const themeRaw = Themes.findOne({ _id: themeId })

		if(!subscriptionReady || !themeRaw) {
			return {
				theme: undefined,
				themeLoading: !subscriptionReady,
			}
		}

		function hasComputedProperties(theme: ThemeData): boolean {
			return "topOrgs" in theme
		}

		if(!hasComputedProperties(themeRaw)) {
			return {
				theme: undefined,
				themeLoading: true,
			}
		}

		return {
			theme: themeRaw as unknown as Pick<ThemeWithComputed, '_id'> & Partial<Omit<ThemeWithComputed, '_id'>>,
			themeLoading: false,
		}
	}, [themeId])
}

