import { Meteor } from 'meteor/meteor'
import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'

import { useTracker } from 'meteor/react-meteor-data'
import { useData } from './DataProvider'
import { useTheme } from './ThemeProvider'
import { PresentationSettings } from '/imports/api/db'
import { SettingsStore } from '/imports/api/stores'

interface ISettingsStoreContext {
	settings: SettingsStore | undefined
	isLoading: boolean
}

const SettingsContext = React.createContext<ISettingsStoreContext>({ isLoading: true, settings: undefined })
export const useSettings = () => useContext(SettingsContext)

interface ISettingsProviderProps {
	children: React.ReactNode
}

const SettingsProvider = observer(({ children }: ISettingsProviderProps) => {
	const { themeId } = useData()
	const { theme, isLoading: themeLoading } = useTheme()

	let subscription: Meteor.SubscriptionHandle
	let cursorObserver: Meteor.LiveQueryHandle
	let settingsStore: SettingsStore

	const settings = useTracker<ISettingsStoreContext>(() => {
		if(!themeId) {
			if(subscription) subscription.stop()
			if(cursorObserver) cursorObserver.stop()

			return {
				isLoading: true,
				settings: undefined,
			}
		}

		// Begin the subscription
		subscription = Meteor.subscribe('settings', themeId, {
			onReady: () => {
				if(!themeLoading) {
					const cursor = PresentationSettings.find({ _id: theme.presentationSettings })
					settingsStore = new SettingsStore(cursor.fetch()[0])

					cursorObserver = cursor.observe({
						added: settings => settingsStore.refreshData(settings),
						changed: settings => settingsStore.refreshData(settings),
					})
				}
			},
		})

		return {
			settings: settingsStore || undefined,
			isLoading: !subscription.ready(),
		}
	}, [themeId, themeLoading])

	return (
		<SettingsContext.Provider value={ settings }>
			{ children }
		</SettingsContext.Provider>
	)
})

export default SettingsProvider
