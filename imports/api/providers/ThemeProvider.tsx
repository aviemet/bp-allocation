import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { observer } from "mobx-react-lite"
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

const ThemeProvider = observer(({ children }: ThemeProviderProps) => {
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

		// Get the theme data directly
		const themeData = Themes.findOne({ _id: themeId })

		// Create the theme store if we have data
		const themeStore = themeData ? new ThemeStore(themeData) : undefined

		return {
			theme: themeStore,
			isLoading: !subscription.ready(),
		}
	}, [themeId])

	return (
		<ThemeContextProvider value={ theme }>
			{ children }
		</ThemeContextProvider>
	)
})

export default ThemeProvider
