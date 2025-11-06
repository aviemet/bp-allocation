import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"

import { useData } from "./DataProvider"
import { Members, type MemberData } from "/imports/api/db"
import { MembersCollection } from "/imports/api/stores"
import { createContext } from "/imports/lib/hooks/createContext"

interface MembersContextValue {
	getAllMembers: () => void
	hideAllMembers: () => void
	setMemberId: (memberId: string | false) => void
	members?: MembersCollection
	isLoading: boolean
}

const [useMembersContext, MembersContextProvider] = createContext<MembersContextValue>()

// Get a single member
export const useMember = (memberId: string) => {
	const membersContext = useMembersContext()

	if(!membersContext) {
		throw new Error("useMember must be used within a MembersProvider")
	}

	membersContext.setMemberId(memberId)
	return membersContext
}

// Get all members
export const useMembers = () => {
	const membersContext = useMembersContext()

	if(!membersContext) {
		throw new Error("useMembers must be used within a MembersProvider")
	}

	return membersContext
}

interface MembersProviderProps {
	children: React.ReactNode
}

const MembersProvider = observer(({ children }: MembersProviderProps) => {
	const appStore = useData()
	const themeId = appStore?.themeId

	// limit of 0 == 'return no records', limit of false == 'no limit'
	const [ subLimit, setSubLimit ] = useState<number | false>(false)
	const [ memberId, setMemberId ] = useState<string | false>(false)

	const getAllMembers = () => setSubLimit(false)
	const hideAllMembers = () => setSubLimit(0)

	const methods = { getAllMembers, hideAllMembers, setMemberId }

	let subscription: Meteor.SubscriptionHandle | undefined
	let cursorObserver: Meteor.LiveQueryHandle | undefined
	let membersCollection: MembersCollection | undefined

	const members = useTracker(() => {
		// Return a single user if memberId is set
		if(memberId) {
			if(!themeId) {
				if(subscription) subscription.stop()
				if(cursorObserver) cursorObserver.stop()
				return Object.assign(methods, {
					isLoading: true,
					members: undefined,
				})
			}

			subscription = Meteor.subscribe("member", { memberId, themeId }, {
				onReady: () => {
					const cursor = Members.find({ })
					if(cursorObserver) {
						cursorObserver.stop()
					}
					membersCollection = new MembersCollection(cursor.fetch())
					cursorObserver = cursor.observe({
						added: (members: MemberData) => membersCollection?.refreshData(members),
						changed: (members: MemberData) => membersCollection?.refreshData(members),
						removed: (members: MemberData) => membersCollection?.refreshData(members),
					})
				},
			})

			if(subscription.ready() && !membersCollection) {
				const cursor = Members.find({ })
				membersCollection = new MembersCollection(cursor.fetch())
				if(cursorObserver) {
					cursorObserver.stop()
				}
				cursorObserver = cursor.observe({
					added: (members: MemberData) => membersCollection?.refreshData(members),
					changed: (members: MemberData) => membersCollection?.refreshData(members),
					removed: (members: MemberData) => membersCollection?.refreshData(members),
				})
			}
		// Return all users if no memberId
		} else {
			// Return loading or uninitialized placeholder data
			if(!themeId || subLimit === 0) {
				if(subscription) subscription.stop()
				if(cursorObserver) cursorObserver.stop()
				membersCollection = undefined

				return Object.assign(methods, {
					isLoading: subLimit === 0 ? false : true,
					members: undefined,
				})
			}

			subscription = Meteor.subscribe("members", { themeId, limit: subLimit }, {
				onReady: () => {
					// Query all members since the server publication handles the theme filtering
					const cursor = Members.find({}, { sort: { number: 1 } })
					if(cursorObserver) {
						cursorObserver.stop()
					}
					membersCollection = new MembersCollection(cursor.fetch())
					cursorObserver = cursor.observe({
						added: (members: MemberData) => membersCollection?.refreshData(members),
						changed: (members: MemberData) => membersCollection?.refreshData(members),
						removed: (members: MemberData) => membersCollection?.refreshData(members),
					})
				},
			})

			if(subscription.ready() && !membersCollection) {
				const cursor = Members.find({}, { sort: { number: 1 } })
				membersCollection = new MembersCollection(cursor.fetch())
				if(cursorObserver) {
					cursorObserver.stop()
				}
				cursorObserver = cursor.observe({
					added: (members: MemberData) => membersCollection?.refreshData(members),
					changed: (members: MemberData) => membersCollection?.refreshData(members),
					removed: (members: MemberData) => membersCollection?.refreshData(members),
				})
			}
		}

		// Query reactively to ensure re-render when data changes
		if(subscription?.ready()) {
			const cursor = memberId ? Members.find({ }) : Members.find({}, { sort: { number: 1 } })
			// Access cursor to make it reactive
			cursor.fetch()
		}

		return Object.assign(methods, {
			members: membersCollection,
			isLoading: !subscription?.ready() || (subscription?.ready() && !membersCollection),
		})

	}, [themeId, subLimit, memberId])

	return (
		<MembersContextProvider value={ members }>
			{ children }
		</MembersContextProvider>
	)

})

export default MembersProvider
