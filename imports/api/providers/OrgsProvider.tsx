import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { observer } from "mobx-react-lite"
import React from "react"

import { useData } from "./DataProvider"
import { useTheme } from "./ThemeProvider"
import { Organizations, type OrgData } from "/imports/api/db"
import { OrgsCollection, OrgStore } from "/imports/api/stores"
import { filterTopOrgs } from "/imports/lib/orgsMethods"
import { Organization, Theme } from "/imports/types/schema"
import { createContext } from "/imports/lib/hooks/createContext"

interface ThemeWithVoting extends Theme {
	numTopOrgs: number
	topOrgsManual: string[]
}

// Type guard to check if theme has voting properties
const isThemeWithVoting = (theme: Theme | undefined): theme is ThemeWithVoting => {
	return theme !== undefined &&
		typeof theme.numTopOrgs === "number" &&
		Array.isArray(theme.topOrgsManual)
}

interface OrgsContextValue {
	orgs?: OrgsCollection
	topOrgs: Organization[]
	isLoading: boolean
}

const [useOrgs, OrgsContextProvider] = createContext<OrgsContextValue>()
export { useOrgs }

interface OrgsProviderProps {
	children: React.ReactNode
}

const OrgsProvider = observer(({ children }: OrgsProviderProps) => {
	const appStore = useData()
	const themeId = appStore?.themeId
	const themeContext = useTheme()
	const theme = themeContext?.theme
	const themeLoading = themeContext?.isLoading || false

	let subscription: Meteor.SubscriptionHandle | undefined
	let cursorObserver: Meteor.LiveQueryHandle | undefined
	let orgsCollection: OrgsCollection | undefined

	const orgs = useTracker(() => {
		if(!themeId || themeLoading) {
			if(subscription) subscription.stop()
			if(cursorObserver) cursorObserver.stop()

			return {
				isLoading: true,
				orgs: undefined,
				topOrgs: [],
			}
		}

		subscription = Meteor.subscribe("organizations", themeId, {
			onReady: () => {
				if(!theme) {
					return
				}

				const cursor = Organizations.find({ theme: themeId })
				orgsCollection = new OrgsCollection(cursor.fetch(), theme, OrgStore)

				cursorObserver = cursor.observe({
					added: (orgs: OrgData) => orgsCollection?.refreshData(orgs),
					changed: (orgs: OrgData) => orgsCollection?.refreshData(orgs),
					removed: (orgs: OrgData) => orgsCollection?.deleteItem(orgs),
				})
			},
		})

		return {
			orgs: orgsCollection,
			topOrgs: !orgsCollection || !isThemeWithVoting(theme) ? [] : filterTopOrgs(orgsCollection.values, theme),
			isLoading: !subscription?.ready(),
		}
	}, [themeId, themeLoading])

	return (
		<OrgsContextProvider value={ orgs }>
			{ children }
		</OrgsContextProvider>
	)
})

export default OrgsProvider
