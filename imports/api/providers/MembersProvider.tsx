import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import { useTracker } from "meteor/react-meteor-data"
import React, { useEffect, useRef, useState } from "react"

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

	const subscriptionRef = useRef<Meteor.SubscriptionHandle | undefined>(undefined)
	const cursorObserverRef = useRef<Meteor.LiveQueryHandle | undefined>(undefined)
	const membersCollectionRef = useRef<MembersCollection | undefined>(undefined)

	// Method to be called when subscription is ready
	const subscriptionReady = (cursor: Mongo.Cursor<MemberData, MemberData>) => {
		membersCollectionRef.current = new MembersCollection(cursor.fetch())

		cursorObserverRef.current = cursor.observe({
			added: members => membersCollectionRef.current!.refreshData(members),
			changed: members => membersCollectionRef.current!.refreshData(members),
			removed: members => membersCollectionRef.current!.deleteItem(members),
		})

		// Used to force re-render
		setRenderCount(renderCount + 1)
	}

	const members = useTracker(() => {
		// Return a single user if memberId is set
		if(memberId) {
			if(!themeId) {
				subscriptionRef.current?.stop()
				cursorObserverRef.current?.stop()

				return Object.assign(methods, {
					isLoading: true,
					members: undefined,
				})
			}

			subscriptionRef.current?.stop()
			subscriptionRef.current = Meteor.subscribe("member", { memberId, themeId }, {
				onReady: () => subscriptionReady(Members.find({ })),
			})

		// Return all users if no memberId
		} else {
			// Return loading or uninitialized placeholder data
			if(!themeId || subLimit === 0) {
				subscriptionRef.current?.stop()
				cursorObserverRef.current?.stop()

				return Object.assign(methods, {
					isLoading: subLimit === 0 ? false : true,
					members: undefined,
				})
			}

			subscriptionRef.current?.stop()
			subscriptionRef.current = Meteor.subscribe("members", { themeId, limit: subLimit }, {
				onReady: () => subscriptionReady(Members.find(
					{ "theme.theme": themeId },
					{ sort: { number: 1 } }
				)),
			})
		}

		return Object.assign(methods, {
			members: membersCollectionRef.current,
			isLoading: !subscriptionRef.current?.ready() || (subscriptionRef.current?.ready() && !membersCollectionRef.current),
		})

	}, [themeId, subLimit, memberId])

	return (
		<MembersContextProvider value={ members }>
			{ children }
		</MembersContextProvider>
	)
}

export default MembersProvider
