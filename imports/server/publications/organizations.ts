import { Meteor } from "meteor/meteor"

import { registerObserver, type PublishSelf } from "../methods"
import { OrgTransformer, aggregateVotesByOrganization } from "/imports/server/transformers"
import { createDebouncedFunction } from "/imports/lib/utils"

import {
	Organizations,
	Themes,
	MemberThemes,
	PresentationSettings,
	type OrgData,
	type ThemeData,
	type SettingsData,
} from "/imports/api/db"
import { type MemberTheme } from "/imports/types/schema"

interface OrgObserverParams {
	theme?: ThemeData
	settings?: SettingsData
	memberThemes: MemberTheme[]
	fundsVotesByOrg?: Record<string, number>
	chitVotesByOrg?: Record<string, number>
}

const orgObserver = registerObserver((doc: OrgData, params: OrgObserverParams) => {
	if(!doc.theme) return { ...doc }

	return OrgTransformer(doc, params)
})

const publishOrganizations = async (themeId: string, publisher: PublishSelf) => {
	const theme = await Themes.findOneAsync({ _id: themeId })
	if(!theme) {
		publisher.ready()
		return
	}

	const settings = theme.presentationSettings ? await PresentationSettings.findOneAsync({ _id: theme.presentationSettings }) : undefined

	let memberThemes = await MemberThemes.find({ theme: themeId }).fetchAsync()
	const { fundsVotesByOrg, chitVotesByOrg } = aggregateVotesByOrganization(
		memberThemes,
		settings?.useKioskFundsVoting || false,
		settings?.useKioskChitVoting || false
	)
	const observerCallbacks = orgObserver("organizations", publisher, { theme, settings, memberThemes, fundsVotesByOrg, chitVotesByOrg })

	const orgs = await Organizations.find({ theme: themeId }).fetchAsync()
	orgs.forEach(org => {
		observerCallbacks.added(org)
	})

	const orgsCursor = Organizations.find({ theme: themeId }).observe(observerCallbacks)

	const refreshOrgsFromMemberThemes = async () => {
		try {
			memberThemes = await MemberThemes.find({ theme: themeId }).fetchAsync()
			const { fundsVotesByOrg, chitVotesByOrg } = aggregateVotesByOrganization(
				memberThemes,
				settings?.useKioskFundsVoting || false,
				settings?.useKioskChitVoting || false
			)
			const orgs = await Organizations.find({ theme: themeId }).fetchAsync()
			orgs.forEach(org => {
				const transformed = OrgTransformer(org, { theme, settings, memberThemes, fundsVotesByOrg, chitVotesByOrg })
				publisher.changed("organizations", org._id, transformed)
			})
		} catch (_error) {
			// Error refreshing organizations from memberThemes
		}
	}

	const debouncedRefresh = createDebouncedFunction(refreshOrgsFromMemberThemes, 100)

	const memberThemesWatcher = MemberThemes.find({ theme: themeId }).observeChanges({
		added: () => {
			debouncedRefresh()
		},
		changed: () => {
			debouncedRefresh()
		},
		removed: () => {
			debouncedRefresh()
		},
	})

	publisher.onStop(() => {
		debouncedRefresh.cancel()
		if(orgsCursor && typeof orgsCursor.stop === "function") {
			orgsCursor.stop()
		}
		if(memberThemesWatcher && typeof memberThemesWatcher.stop === "function") {
			memberThemesWatcher.stop()
		}
	})

	publisher.ready()
}

Meteor.publish("organizations", async function(themeId: string) {
	if(!themeId) {
		this.ready()
		return
	}

	await publishOrganizations(themeId, this)
})
