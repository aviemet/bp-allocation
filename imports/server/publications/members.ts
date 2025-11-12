import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"

import { Members, MemberThemes, type MemberData } from "/imports/api/db"
import { MemberTransformer } from "/imports/server/transformers"
import { registerObserver } from "../methods"
import { type MemberTheme } from "/imports/types/schema"

interface MembersTransformerParams {
	themeId: string
	memberThemes: MemberTheme[]
}

const membersTransformer = registerObserver((doc: MemberData, params: MembersTransformerParams) => {
	const memberTheme = params.memberThemes
		.find(theme => theme.member === doc._id && theme.theme === params.themeId)
	return MemberTransformer(doc, memberTheme)
})

// MemberThemes - Member activity for theme
Meteor.publish("memberThemes", (themeId?: string) => {
	if(!themeId) return MemberThemes.find({})

	return MemberThemes.find({ theme: themeId })
})

// limit of 0 == 'return no records', limit of false == 'no limit'
Meteor.publish("members", function({ themeId, limit }: { themeId: string, limit: number | false }) {
	if(limit === 0) {
		this.ready()
		return
	}

	const subOptions: { sort: Mongo.SortSpecifier, limit?: number } = { sort: { number: 1 } }
	if(limit !== false) {
		subOptions.limit = limit
	}

	let membersObserver: Meteor.LiveQueryHandle | null = null
	let hasCalledReady = false

	const stopMembersObserver = () => {
		if(membersObserver && typeof membersObserver.stop === "function") {
			membersObserver.stop()
		}
		membersObserver = null
	}

	const publication = this
	let isStopped = false
	const memberThemesCursor = MemberThemes.find({ theme: themeId })
	const watchers: Meteor.LiveQueryHandle[] = []
	let refreshInProgress = false
	let refreshQueued = false
	let currentMemberIds = new Set<string>()

	const refreshMembers = async () => {
		try {
			const memberThemes = await memberThemesCursor.fetchAsync()
			if(isStopped) {
				return
			}

			stopMembersObserver()

			const memberIds = memberThemes
				.map(memberTheme => memberTheme.member)
				.filter((memberId): memberId is string => typeof memberId === "string")

			const nextMemberIds = new Set(memberIds)
			const previousMemberIds = currentMemberIds
			previousMemberIds.forEach(memberId => {
				if(!nextMemberIds.has(memberId)) {
					publication.removed("members", memberId)
				}
			})
			currentMemberIds = new Set(nextMemberIds)

			if(memberIds.length > 0) {
				const observerCallbacks = membersTransformer("members", publication, { themeId, memberThemes })
				membersObserver = Members
					.find({ _id: { $in: memberIds } }, subOptions)
					.observe({
						added: doc => {
							if(previousMemberIds.has(doc._id)) {
								observerCallbacks.changed(doc)
							} else {
								observerCallbacks.added(doc)
							}
							currentMemberIds.add(doc._id)
						},
						changed: doc => {
							observerCallbacks.changed(doc)
						},
						removed: doc => {
							observerCallbacks.removed(doc)
							currentMemberIds.delete(doc._id)
						},
					})
			} else {
				currentMemberIds.clear()
			}

			if(!hasCalledReady) {
				publication.ready()
				hasCalledReady = true
			}
		} catch (error) {
			const castError = error instanceof Error ? error : new Error(String(error))
			publication.error(castError)
		}
	}

	const scheduleRefresh = () => {
		if(isStopped) {
			return
		}
		if(refreshInProgress) {
			refreshQueued = true
			return
		}
		refreshInProgress = true
		void refreshMembers().finally(() => {
			refreshInProgress = false
			if(refreshQueued) {
				refreshQueued = false
				scheduleRefresh()
			}
		})
	}

	watchers.push(memberThemesCursor.observeChanges({
		added: scheduleRefresh,
		changed: scheduleRefresh,
		removed: scheduleRefresh,
	}))

	scheduleRefresh()

	this.onStop(() => {
		isStopped = true
		stopMembersObserver()
		watchers.forEach(handle => {
			if(handle && typeof handle.stop === "function") {
				handle.stop()
			}
		})
	})
})

Meteor.publish("member", function({ memberId, themeId }: { memberId?: string, themeId: string }) {
	if(!memberId) {
		this.ready()
		return
	}

	const memberTheme = MemberThemes.findOne({ member: memberId, theme: themeId })
	const memberThemes = memberTheme ? [memberTheme] : []

	const memberObserver = Members.find({ _id: memberId }).observe(membersTransformer("members", this, { themeId, memberThemes }))

	this.onStop(() => {
		if(memberObserver && typeof memberObserver.stop === "function") {
			memberObserver.stop()
		}
	})
	this.ready()
})
