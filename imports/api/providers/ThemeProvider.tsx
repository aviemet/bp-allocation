import { Meteor } from 'meteor/meteor'
import React from 'react'
import { observer } from 'mobx-react-lite'

import { useTracker } from 'meteor/react-meteor-data'
import { useData } from './DataProvider'
import { Themes } from '/imports/api/db'
import { ThemeStore } from '/imports/api/stores'
import { createContext } from '/imports/lib/hooks'

const [useTheme, ThemeProvider] = createContext<{
	theme: ThemeStore
	isLoading: boolean
}>()
export { useTheme }

// Provider to wrap the application with
// Observes changes on the data store to manage subscription to the theme
const ThemeProviderComponent = observer(({ children }: {children: React.ReactNode}) => {
	const { themeId } = useData()
	let subscription: Meteor.SubscriptionHandle
	let cursorObserver: Meteor.LiveQueryHandle
	let themeStore: ThemeStore

	// Setup Meteor tracker to subscribe to a Theme
	const theme = useTracker(() => {
		if(!themeId) {
			if(subscription) subscription.stop()
			if(cursorObserver) cursorObserver.stop()

			return {
				isLoading: true,
				theme: undefined,
			}
		}

		// Begin the subscription
		subscription = Meteor.subscribe('theme', themeId, {
			onReady: () => {
				const cursor = Themes.find({ _id: themeId })
				themeStore = new ThemeStore(cursor.fetch()[0])

				cursorObserver = cursor.observe({
					added: theme => themeStore.refreshData(theme),
					changed: theme => themeStore.refreshData(theme),
				})
			},
		})

		return {
			theme: themeStore,
			isLoading: !subscription.ready(),
		}

	}, [themeId])

	return (
		<ThemeProvider value={ theme }>
			{ children }
		</ThemeProvider>
	)
})

export default ThemeProviderComponent
