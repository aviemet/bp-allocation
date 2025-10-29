import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
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
	let subscription: Meteor.SubscriptionHandle | undefined
	let cursorObserver: Meteor.LiveQueryHandle | undefined
	let membersCollection: MembersCollection | undefined

	// limit of 0 == 'return no records', limit of false == 'no limit'
	const [ subLimit, setSubLimit ] = useState<number | false>(false) // Start with false to load members immediately
	// const [ subIndex, setSubIndex ] = useState(0)

	const [ renderCount, setRenderCount ] = useState(0)
	const [ memberId, setMemberId ] = useState<string | false>(false)

	const getAllMembers = () => setSubLimit(false)
	const hideAllMembers = () => setSubLimit(0)

	const methods = { getAllMembers, hideAllMembers, setMemberId }

	// Method to be called when subscription is ready
	const subscriptionReady = (cursor: Mongo.Cursor<MemberData>) => {
		membersCollection = new MembersCollection(cursor.fetch())

		cursorObserver = cursor.observe({
			added: (members: MemberData) => membersCollection?.refreshData(members),
			changed: (members: MemberData) => membersCollection?.refreshData(members),
			removed: (members: MemberData) => membersCollection?.refreshData(members),
		})
		// Used to force re-render
		setRenderCount(renderCount + 1)
	}

	const members = useTracker(() => {
		// Return a single user if memberId is set
		if(memberId) {
			subscription = Meteor.subscribe("member", { memberId, themeId }, {
				onReady: () => {
					subscriptionReady(Members.find({ }))
				},
			})
		// Return all users if no memberId
		} else {
			// Return loading or uninitialized placeholder data
			if(!themeId || subLimit === 0) {
				if(subscription) subscription.stop()
				if(cursorObserver) cursorObserver.stop()

				return Object.assign(methods, {
					isLoading: subLimit === 0 ? false : true,
					members: undefined,
				})
			}

			subscription = Meteor.subscribe("members", { themeId, limit: subLimit }, {
				onReady: () => {
					// Query all members since the server publication handles the theme filtering
					subscriptionReady(Members.find({}, { sort: { number: 1 } }))
				},
			})
		}

		return Object.assign(methods, {
			members: membersCollection,
			isLoading: !subscription?.ready(),
		})

	}, [themeId, subLimit, memberId, renderCount])

	return (
		<MembersContextProvider value={ members }>
			{ children }
		</MembersContextProvider>
	)

})

export default MembersProvider
