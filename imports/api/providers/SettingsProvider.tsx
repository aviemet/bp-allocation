import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import React, { useEffect, useRef } from "react"

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

const SettingsProvider = ({ children }: SettingsProviderProps) => {
	const { themeId } = useData()

	useTheme()

	const storeRef = useRef<SettingsStore | undefined>(undefined)

	const { data, ready } = useTracker(() => {
		if(!themeId) {
			return { data: undefined, ready: false }
		}
		const sub = Meteor.subscribe("settings", themeId)
		const subscriptionReady = sub.ready()
		const hasSettingsData = subscriptionReady && PresentationSettings.find().count() > 0
		const data = PresentationSettings.findOne()
		return { data, ready: hasSettingsData }
	}, [themeId])

	useEffect(() => {
		if(!data) return
		if(!storeRef.current || storeRef.current._id !== data._id) {
			storeRef.current = new SettingsStore(data)
			return
		}
		storeRef.current.refreshData(data)
	}, [data])

	const contextValue: SettingsContextValue = {
		settings: storeRef.current,
		isLoading: !ready,
	}

	return (
		<SettingsContextProvider value={ contextValue }>
			{ children }
		</SettingsContextProvider>
	)
}

export default SettingsProvider
