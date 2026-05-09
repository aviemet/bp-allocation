import { Meteor } from "meteor/meteor"

import { registerObserver, type PublishSelf } from "../methods"
import { OrgTransformer, aggregateVotesByOrganization } from "/imports/server/transformers"
import { registerMemberThemesRefreshListener } from "/imports/server/publications/memberThemesRefreshCoordinator"

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
	const orgObserverParams: OrgObserverParams = {
		theme,
		settings,
		memberThemes,
		fundsVotesByOrg,
		chitVotesByOrg,
	}
	const observerCallbacks = orgObserver("organizations", publisher, orgObserverParams)

	const orgs = await Organizations.find({ theme: themeId }).fetchAsync()
	orgs.forEach(org => {
		observerCallbacks.added(org)
	})

	const orgsCursor = Organizations.find({ theme: themeId }).observe(observerCallbacks)

	const refreshOrgsFromMemberThemes = async (freshMemberThemes: MemberTheme[]) => {
		try {
			memberThemes = freshMemberThemes
			orgObserverParams.memberThemes = freshMemberThemes
			const aggregated = aggregateVotesByOrganization(
				freshMemberThemes,
				settings?.useKioskFundsVoting || false,
				settings?.useKioskChitVoting || false
			)
			orgObserverParams.fundsVotesByOrg = aggregated.fundsVotesByOrg
			orgObserverParams.chitVotesByOrg = aggregated.chitVotesByOrg
			const organizationsList = await Organizations.find({ theme: themeId }).fetchAsync()
			organizationsList.forEach(organization => {
				const transformed = OrgTransformer(organization, orgObserverParams)
				publisher.changed("organizations", organization._id, transformed)
			})
		} catch (_error) {
			// Error refreshing organizations from memberThemes
		}
	}

	const unsubscribeMemberThemes = registerMemberThemesRefreshListener(themeId, freshRows => {
		void refreshOrgsFromMemberThemes(freshRows)
	})

	publisher.onStop(() => {
		unsubscribeMemberThemes()
		if(orgsCursor && typeof orgsCursor.stop === "function") {
			orgsCursor.stop()
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
