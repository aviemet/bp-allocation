import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import React from "react"

import { useData } from "./DataProvider"
import { useTheme } from "./ThemeProvider"
import { Organizations, type OrgData } from "/imports/api/db"
import { OrgsCollection, OrgStore } from "/imports/api/stores"
import { filterTopOrgs } from "/imports/lib/orgsMethods"
import { createContext } from "/imports/lib/hooks/createContext"

interface OrgsContextValue {
	orgs?: OrgsCollection
	topOrgs: OrgStore[]
	isLoading: boolean
}

const [useOrgs, OrgsContextProvider] = createContext<OrgsContextValue>()
export { useOrgs }

interface OrgsProviderProps {
	children: React.ReactNode
}

const OrgsProvider = ({ children }: OrgsProviderProps) => {
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

			cursorObserver = cursor.observe({
				added: (orgs: OrgData) => orgsCollection?.refreshData(orgs),
				changed: (orgs: OrgData) => orgsCollection?.refreshData(orgs),
				removed: (orgs: OrgData) => orgsCollection?.deleteItem(orgs),
			})
		}

		if(!orgsCollection) {
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
}

export default OrgsProvider
