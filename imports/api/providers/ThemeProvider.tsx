import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { observer } from "mobx-react-lite"
import PropTypes from "prop-types"
import React, { useContext } from "react"

import { useData } from "./DataProvider"
import { Themes } from "/imports/api/db"
import { ThemeStore } from "/imports/api/stores"

// Create the context and context hook
const ThemeContext = React.createContext("theme")
export const useTheme = () => useContext(ThemeContext)

// Provider to wrap the application with
// Observes changes on the data store to manage subscription to the theme
const ThemeProvider = observer(({ children }) => {
	const data = useData()
	const themeId = data.themeId

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
		<ThemeContext.Provider value={ theme }>
			{ children }
		</ThemeContext.Provider>
	)
})

ThemeProvider.propTypes = {
	children: PropTypes.any,
}

export default ThemeProvider
