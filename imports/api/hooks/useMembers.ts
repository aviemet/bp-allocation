import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { useMemo, useState } from "react"

import { Members, type MemberData } from "../db"
import { useData } from "../providers/DataProvider"
import { filterCollection } from "/imports/lib/utils"

export const MEMBER_SEARCHABLE_FIELDS: (keyof MemberData)[] = ["firstName", "lastName", "fullName", "code", "initials", "number", "phone"]

export const useMembers = () => {
	const data = useData()
	const themeId = data?.themeId
	const [searchFilter, setSearchFilter] = useState<string | null>(null)

	const membersData = useTracker(() => {
		if(!themeId) {
			return {
				members: [] as MemberData[],
				membersLoading: true,
			}
		}

		const subscription = Meteor.subscribe("members", { themeId, limit: false })
		const subscriptionReady = subscription.ready()
		const members = Members.find(
			{ "theme.theme": themeId },
			{ sort: { number: 1 } }
		).fetch()

		return {
			members,
			membersLoading: !subscriptionReady,
		}
	}, [themeId])

	const filteredMembers = useMemo(() => {
		if(!searchFilter || !membersData.members.length) return membersData.members
		return filterCollection(membersData.members, searchFilter, MEMBER_SEARCHABLE_FIELDS)
	}, [membersData.members, searchFilter])

	return {
		members: membersData.members,
		filteredMembers,
		membersLoading: membersData.membersLoading,
		searchFilter,
		setSearchFilter,
		searchableFields: MEMBER_SEARCHABLE_FIELDS,
	}
}

export const useMember = (memberId: string) => {
	const data = useData()
	const themeId = data?.themeId

	return useTracker(() => {
		if(!themeId || !memberId) {
			return {
				member: undefined,
				memberLoading: true,
			}
		}

		const subscription = Meteor.subscribe("member", { memberId, themeId })
		const subscriptionReady = subscription.ready()
		const member = Members.findOne()

		return {
			member: member as MemberData | undefined,
			memberLoading: !subscriptionReady,
		}
	}, [themeId, memberId])
}

