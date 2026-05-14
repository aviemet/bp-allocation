import { ValidatedMethod } from "meteor/mdg:validated-method"

import { fetchMemberSnapshot, fetchMembersSnapshot } from "/imports/server/snapshots/members"
import { fetchOrgsSnapshot } from "/imports/server/snapshots/organizations"

export const organizationsListMethod = new ValidatedMethod({
	name: "organizations.list",

	validate: null,

	async run({ themeId }: { themeId: string }) {
		if(typeof themeId !== "string" || themeId.length === 0) {
			return null
		}
		return await fetchOrgsSnapshot(themeId)
	},
})

export const membersListMethod = new ValidatedMethod({
	name: "members.list",

	validate: null,

	async run({ themeId, limit }: { themeId: string, limit?: number | false }) {
		if(typeof themeId !== "string" || themeId.length === 0) {
			return []
		}
		const resolvedLimit = limit === undefined ? false : limit
		if(resolvedLimit === 0) {
			return []
		}
		return await fetchMembersSnapshot(themeId, resolvedLimit)
	},
})

export const membersGetMethod = new ValidatedMethod({
	name: "members.get",

	validate: null,

	async run({ memberId, themeId }: { memberId: string, themeId: string }) {
		if(typeof memberId !== "string" || typeof themeId !== "string" || !memberId || !themeId) {
			return null
		}
		return await fetchMemberSnapshot(memberId, themeId)
	},
})
