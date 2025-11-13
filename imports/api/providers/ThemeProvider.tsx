import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import React from "react"

import { useData } from "./DataProvider"
import { Themes } from "/imports/api/db"
import { ThemeStore } from "/imports/api/stores"
import { createContext } from "/imports/lib/hooks/createContext"

interface ThemeContextValue {
	theme?: ThemeStore
	isLoading: boolean
}

const [useTheme, ThemeContextProvider] = createContext<ThemeContextValue>()
export { useTheme }

interface ThemeProviderProps {
	children: React.ReactNode
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
	const { themeId } = useData()

	// Setup Meteor tracker to subscribe to a Theme
	const theme = useTracker(() => {
		if(!themeId) {
			return {
				isLoading: true,
				theme: undefined,
			}
		}

		// Begin the subscription
		const subscription = Meteor.subscribe("theme", themeId)
		const subscriptionReady = subscription.ready()

		// Get the theme data directly (reactive query)
		const themeData = Themes.findOne({ _id: themeId })

		// Check if data has synced to local collection
		const collectionHasData = Themes.find().count() > 0

		// Create the theme store if we have data
		const themeStore = themeData ? new ThemeStore(themeData) : undefined

		// Mark as loaded when subscription is ready AND data has synced to collection
		// If subscription is ready but collection is empty, wait for data to sync
		// Once data syncs (or we confirm it doesn't exist), mark as loaded
		const isLoading = !subscriptionReady || (subscriptionReady && !collectionHasData && !themeData)

		return {
			theme: themeStore,
			isLoading,
		}
	}, [themeId])

	return (
		<ThemeContextProvider value={ theme }>
			{ children }
		</ThemeContextProvider>
	)
}

export default ThemeProvider
