import { Meteor } from 'meteor/meteor'
import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react-lite'

import { useTracker } from 'meteor/react-meteor-data'
import { useData } from './DataProvider'
import { Themes } from '/imports/api/db'
import { ThemeStore } from '/imports/api/stores'

// Create the context and context hook
const ThemeContext = React.createContext('theme')
export const useTheme = () => useContext(ThemeContext)

// Provider to wrap the application with
// Observes changes on the data store to manage subscription to the theme
const ThemeProvider = observer(({ children }) => {
	const { themeId } = useData()
	let subscription
	let cursorObserver
	let themeStore // The MobX store for the theme

	// Setup Meteor tracker to subscribe to a Theme
	const theme = useTracker(() => {
		if(!themeId) {
			if(subscription) subscription.stop()
			if(cursorObserver) cursorObserver.stop()

			return {
				isLoading: true,
				theme: undefined
			}
		}

		// Begin the subscription
		subscription = Meteor.subscribe('theme', themeId, {
			onReady: () => {
				const cursor = Themes.find({ _id: themeId })
				themeStore = cursor ? new ThemeStore(cursor.fetch()[0]) : undefined

				cursorObserver = cursor.observe({
					added: theme => themeStore.refreshData(theme),
					changed: theme => themeStore.refreshData(theme)
				})
			}
		})

		return {
			theme: themeStore,
			isLoading: !subscription.ready()
		}

	}, [themeId])

	return (
		<ThemeContext.Provider value={ theme }>
			{ children }
		</ThemeContext.Provider>
	)
})

ThemeProvider.propTypes = {
	children: PropTypes.any
}

export default ThemeProvider