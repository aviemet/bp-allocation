import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import { useTracker } from "meteor/react-meteor-data"
import React, { useEffect, useState } from "react"

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

export const useMember = (memberId: string) => {
	const membersContext = useMembersContext()

	membersContext.setMemberId(memberId)
	return membersContext
}

export const useMembers = () => {
	const membersContext = useMembersContext()

	useEffect(() => {
		membersContext.getAllMembers()
		return () => {
			membersContext.hideAllMembers()
		}
	}, [])

	return membersContext
}

interface MembersProviderProps {
	children: React.ReactNode
}

const MembersProvider = ({ children }: MembersProviderProps) => {
	const { themeId } = useData()

	// limit of 0 == 'return no records', limit of false == 'no limit'
	const [ subLimit, setSubLimit ] = useState<number | false>(false)
	const [ memberId, setMemberId ] = useState<string | false>(false)
	const [ renderCount, setRenderCount ] = useState(0)

	const getAllMembers = () => setSubLimit(false)
	const hideAllMembers = () => setSubLimit(0)

	const methods = { getAllMembers, hideAllMembers, setMemberId }

	let subscription: Meteor.SubscriptionHandle | undefined
	let cursorObserver: Meteor.LiveQueryHandle | undefined
	let membersCollection: MembersCollection | undefined

	// Method to be called when subscription is ready
	const subscriptionReady = (cursor: Mongo.Cursor<MemberData, MemberData>) => {
		membersCollection = new MembersCollection(cursor.fetch())

		cursorObserver = cursor.observe({
			added: members => membersCollection!.refreshData(members),
			changed: members => membersCollection!.refreshData(members),
			removed: members => membersCollection!.deleteItem(members),
		})

		// Used to force re-render
		setRenderCount(renderCount + 1)
	}

	const members = useTracker(() => {
		// Return a single user if memberId is set
		if(memberId) {
			if(!themeId) {
				subscription?.stop()
				cursorObserver?.stop()

				return Object.assign(methods, {
					isLoading: true,
					members: undefined,
				})
			}

			subscription = Meteor.subscribe("member", { memberId, themeId }, {
				onReady: () => subscriptionReady(Members.find({ })),
			})

		// Return all users if no memberId
		} else {
			// Return loading or uninitialized placeholder data
			if(!themeId || subLimit === 0) {
				subscription?.stop()
				cursorObserver?.stop()

				return Object.assign(methods, {
					isLoading: subLimit === 0 ? false : true,
					members: undefined,
				})
			}

			subscription = Meteor.subscribe("members", { themeId, limit: subLimit }, {
				onReady: () => subscriptionReady(Members.find(
					{ "theme.theme": themeId },
					{ sort: { number: 1 } }
				)),
			})
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
}

export default MembersProvider
