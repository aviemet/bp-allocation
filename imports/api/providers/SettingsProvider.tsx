import { Meteor } from "meteor/meteor"
import React, { useContext, useState } from "react"
import PropTypes from "prop-types"
import { observer } from "mobx-react-lite"

import { useTracker } from "meteor/react-meteor-data"
import { useData } from "./DataProvider"
import { useTheme } from "./ThemeProvider"
import { PresentationSettings } from "/imports/api/db"
import { SettingsStore } from "/imports/api/stores"

const SettingsContext = React.createContext("settings")
export const useSettings = () => useContext(SettingsContext)

const SettingsProvider = observer(({ children }) => {
	const { themeId } = useData()
	const { theme, isLoading: themeLoading } = useTheme()
	let subscription
	let cursorObserver
	let settingsStore // The MobX store for the settings

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
			settings: settingsStore || {},
			isLoading: !subscription.ready(),
		}
	}, [themeId, themeLoading])

	return (
		<SettingsContext.Provider value={ settings }>
			{ children }
		</SettingsContext.Provider>
	)
})

SettingsProvider.propTypes = {
	children: PropTypes.any,
}

export default SettingsProvider
