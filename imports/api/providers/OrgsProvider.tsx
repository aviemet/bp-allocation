import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { observer } from "mobx-react-lite"
import React from "react"

import { useData } from "./DataProvider"
import { useTheme } from "./ThemeProvider"
import { Organizations, type OrgData } from "/imports/api/db"
import { OrgsCollection, OrgStore, type OrganizationWithComputed } from "/imports/api/stores"
import { filterTopOrgs } from "/imports/lib/orgsMethods"
import { Theme } from "/imports/types/schema"
import { createContext } from "/imports/lib/hooks/createContext"

interface ThemeWithVoting extends Theme {
	numTopOrgs: number
	topOrgsManual: string[]
}

const isThemeWithVoting = (theme: Theme | undefined): theme is ThemeWithVoting => {
	return !!(theme && typeof theme.numTopOrgs === "number" && Array.isArray(theme.topOrgsManual))
}

interface OrgsContextValue {
	orgs?: OrgsCollection
	topOrgs: OrganizationWithComputed[]
	isLoading: boolean
}

const [useOrgs, OrgsContextProvider] = createContext<OrgsContextValue>()
export { useOrgs }

interface OrgsProviderProps {
	children: React.ReactNode
}

const OrgsProvider = observer(({ children }: OrgsProviderProps) => {
	const { themeId } = useData()
	const { theme, isLoading: themeLoading } = useTheme()

	let subscription: Meteor.SubscriptionHandle | undefined
	let cursorObserver: Meteor.LiveQueryHandle | undefined
	let orgsCollection: OrgsCollection | undefined

	const orgs = useTracker(() => {
		if(!themeId || themeLoading || !theme) {
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
				const cursor = Organizations.find({ theme: themeId })
				orgsCollection = new OrgsCollection(cursor.fetch(), theme, OrgStore)

				cursorObserver = cursor.observe({
					added: (orgs: OrgData) => orgsCollection?.refreshData(orgs),
					changed: (orgs: OrgData) => orgsCollection?.refreshData(orgs),
					removed: (orgs: OrgData) => orgsCollection?.deleteItem(orgs),
				})
			},
		})

		if(subscription.ready() && !orgsCollection) {
			const cursor = Organizations.find({ theme: themeId })
			orgsCollection = new OrgsCollection(cursor.fetch(), theme, OrgStore)

			if(cursorObserver) {
				cursorObserver.stop()
			}
			cursorObserver = cursor.observe({
				added: (orgs: OrgData) => orgsCollection?.refreshData(orgs),
				changed: (orgs: OrgData) => orgsCollection?.refreshData(orgs),
				removed: (orgs: OrgData) => orgsCollection?.deleteItem(orgs),
			})
		}

		if(!orgsCollection || !isThemeWithVoting(theme)) {
			return {
				orgs: orgsCollection,
				topOrgs: [],
				isLoading: !subscription?.ready() || !orgsCollection,
			}
		}

		const topOrgs = filterTopOrgs(orgsCollection.values, theme)

		return {
			orgs: orgsCollection,
			topOrgs,
			isLoading: !subscription?.ready(),
		}
	}, [themeId, themeLoading, theme])

	return (
		<OrgsContextProvider value={ orgs }>
			{ children }
		</OrgsContextProvider>
	)
})

export default OrgsProvider
