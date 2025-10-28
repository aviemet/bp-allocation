import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { observer } from "mobx-react-lite"
import React from "react"

import { useData } from "./DataProvider"
import { useTheme } from "./ThemeProvider"
import { PresentationSettings } from "/imports/api/db"
import { SettingsStore } from "/imports/api/stores"
import { createContext } from "/imports/lib/hooks/createContext"

interface SettingsContextValue {
	settings?: SettingsStore
	isLoading: boolean
}

const [useSettings, SettingsContextProvider] = createContext<SettingsContextValue>()
export { useSettings }

interface SettingsProviderProps {
	children: React.ReactNode
}

const SettingsProvider = observer(({ children }: SettingsProviderProps) => {
	const appStore = useData()
	const themeId = appStore?.themeId
	const themeContext = useTheme()
	const theme = themeContext?.theme
	const themeLoading = themeContext?.isLoading || false

	let subscription: Meteor.SubscriptionHandle | undefined
	let cursorObserver: Meteor.LiveQueryHandle | undefined
	let settingsStore: SettingsStore | undefined

	const settings = useTracker(() => {
		if(!themeId) {
			if(subscription) subscription.stop()
			if(cursorObserver) cursorObserver.stop()

			return {
				isLoading: true,
				settings: undefined,
			}
		}

		// Begin the subscription
		subscription = Meteor.subscribe("settings", themeId, {
			onReady: () => {
				if(!themeLoading && theme && theme.presentationSettings) {
					const cursor = PresentationSettings.find({ _id: theme.presentationSettings })
					const settingsData = cursor.fetch()[0]
					if(settingsData) {
						settingsStore = new SettingsStore(settingsData)

						cursorObserver = cursor.observe({
							added: (settings) => settingsStore?.refreshData(settings),
							changed: (settings) => settingsStore?.refreshData(settings),
						})
					}
				}
			},
		})

		return {
			settings: settingsStore,
			isLoading: !subscription?.ready(),
		}
	}, [themeId, themeLoading])

	return (
		<SettingsContextProvider value={ settings }>
			{ children }
		</SettingsContextProvider>
	)
})

export default SettingsProvider
