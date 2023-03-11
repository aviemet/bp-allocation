import { Meteor } from 'meteor/meteor'
import React from 'react'
import { observer } from 'mobx-react-lite'

import { useTracker } from 'meteor/react-meteor-data'
import { useData } from './DataProvider'
import { Organizations } from '/imports/api/db'
import { OrgsCollection } from '/imports/api/stores'
import { filterTopOrgs } from '/imports/lib/orgsMethods'
import { createContext } from '/imports/lib/hooks'
import { useTheme } from './ThemeProvider'

const [useOrgs, OrgsContextProvider] = createContext<{
	orgs: OrgsCollection
	topOrgs: OrgsCollection
	isLoading: boolean
}>()
export { useOrgs }

const OrgsProvider = observer(({ children }: { children: React.ReactNode }) => {
	const { themeId } = useData()
	const { theme, isLoading: themeLoading } = useTheme()

	let subscription: Meteor.SubscriptionHandle
	let cursorObserver: Meteor.LiveQueryHandle
	let orgsCollection: OrgsCollection

	const orgs = useTracker(() => {
		if(!themeId || themeLoading) {
			if(subscription) subscription.stop()
			if(cursorObserver) cursorObserver.stop()

			return {
				isLoading: true,
				orgs: undefined,
			}
		}

		subscription = Meteor.subscribe('organizations', themeId, {
			onReady: () => {
				const cursor = Organizations.find({ theme: themeId })
				orgsCollection = new OrgsCollection(cursor.fetch(), theme)

				cursorObserver = cursor.observe({
					added: orgs => orgsCollection.refreshData(orgs),
					changed: orgs => orgsCollection.refreshData(orgs),
					removed: orgs => orgsCollection.deleteItem(orgs),
				})
			},
		})

		return {
			orgs: orgsCollection,
			topOrgs: !orgsCollection ? [] : filterTopOrgs(orgsCollection.values, theme),
			isLoading: !subscription.ready(),
		}
	}, [themeId, themeLoading])

	return (
		<OrgsContextProvider value={ orgs || {
			orgs: [],
			topOrgs: [],
			isLoading: true,
		} }>
			{ children }
		</OrgsContextProvider>
	)
})

export default OrgsProvider
