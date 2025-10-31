import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import { Tracker } from "meteor/tracker"

import { Members, MemberThemes, type MemberData } from "/imports/api/db"
import { MemberTransformer } from "/imports/server/transformers"
import { registerObserver } from "../methods"
import { type MemberTheme } from "/imports/types/schema"

interface MembersTransformerParams {
	themeId: string
	memberThemesMap: Map<string, MemberTheme>
	debug?: boolean
}

const membersTransformer = registerObserver((doc: MemberData, params: MembersTransformerParams) => {
	const memberTheme = params.memberThemesMap.get(doc._id)
	const transformed = MemberTransformer({ ...doc, theme: memberTheme }, memberTheme)
	return { ...transformed }
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

	let membersObserver: { stop: () => void } | null = null

	const computation = Tracker.autorun(async() => {
		if(membersObserver && typeof membersObserver.stop === "function") {
			membersObserver.stop()
			membersObserver = null
		}

		const memberThemes = await MemberThemes.find({ theme: themeId }).fetchAsync()
		const memberIds = memberThemes
			.map(mt => mt.member)
			.filter((id): id is string => typeof id === "string")

		const memberThemesMap = new Map<string, MemberTheme>()
		memberThemes.forEach((mt) => {
			if(mt.member) {
				memberThemesMap.set(mt.member, mt)
			}
		})

		const observerHandle = Members.find({ _id: { $in: memberIds } }, subOptions).observe(membersTransformer("members", this, { themeId, memberThemesMap }))
		membersObserver = observerHandle
		this.ready()
	})

	this.onStop(() => {
		if(membersObserver && typeof membersObserver.stop === "function") {
			membersObserver.stop()
		}
		computation.stop()
	})
})

Meteor.publish("member", async function({ memberId, themeId }: { memberId?: string, themeId: string }) {
	if(!memberId) {
		this.ready()
		return
	}

	const memberTheme = await MemberThemes.findOneAsync({ member: memberId, theme: themeId })
	const memberThemesMap = new Map<string, MemberTheme>()
	if(memberTheme) {
		memberThemesMap.set(memberId, memberTheme)
	}

	const memberObserver = Members.find({ _id: memberId }).observe(membersTransformer("members", this, { themeId, memberThemesMap, debug: true }))

	this.onStop(() => {
		if(memberObserver && typeof memberObserver.stop === "function") {
			memberObserver.stop()
		}
	})
	this.ready()
})
