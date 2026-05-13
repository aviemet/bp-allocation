import { Meteor } from "meteor/meteor"

import { registerObserver, type PublishSelf } from "../methods"
import { OrgTransformer, aggregateVotesByOrganization } from "/imports/server/transformers"
import { registerMemberThemesRefreshListener } from "/imports/server/publications/memberThemesRefreshCoordinator"
import { computePledgeMatchingForPublication } from "/imports/lib/pledgeMatching"
import { filterTopOrgs } from "/imports/lib/orgsMethods"
import { calculateVotesFromRawOrg } from "/imports/server/transformers/orgTransformer"
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
import { LogModels } from "/imports/api/db/Logs"
import { publicationLog } from "/imports/lib/loggers"
import { type MemberTheme } from "/imports/types/schema"

interface OrgObserverParams {
	theme?: ThemeData
	settings?: SettingsData
	memberThemes: MemberTheme[]
	fundsVotesByOrg?: Record<string, number>
	chitVotesByOrg?: Record<string, number>
	topOrgIds?: Set<string>
	matchedAmounts?: Map<string, number>
}

const computeMatching = (
	rawOrgs: OrgData[],
	theme: ThemeData,
	settings: SettingsData | undefined,
	memberThemes: MemberTheme[],
	chitVotesByOrg: Record<string, number>,
) => {
	const orgsWithVotes = rawOrgs.map(org => ({
		...org,
		votes: settings ? calculateVotesFromRawOrg(org, settings, theme, chitVotesByOrg) : 0,
	}))
	const preliminaryTopOrgs = filterTopOrgs(orgsWithVotes, theme)
	const topOrgIds = new Set(preliminaryTopOrgs.map(org => org._id))

	const matching = computePledgeMatchingForPublication(
		rawOrgs,
		topOrgIds,
		theme,
		settings?.useKioskFundsVoting || false,
		memberThemes,
	)

	return { topOrgIds, matchedAmounts: matching.matchedAmounts }
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

	const initialOrgs = await Organizations.find({ theme: themeId }).fetchAsync()
	const initialMatching = computeMatching(initialOrgs, theme, settings, memberThemes, chitVotesByOrg)

	const orgObserverParams: OrgObserverParams = {
		theme,
		settings,
		memberThemes,
		fundsVotesByOrg,
		chitVotesByOrg,
		topOrgIds: initialMatching.topOrgIds,
		matchedAmounts: initialMatching.matchedAmounts,
	}
	const observerCallbacks = orgObserver("organizations", publisher, orgObserverParams)

	initialOrgs.forEach(org => {
		observerCallbacks.added(org)
	})

	// Refreshes matchedAmounts and re-publishes every org. Required because a single
	// org change (e.g. new pledge pushed) shifts the chronological pool walk, which
	// can change pledgeTotal for any other org sharing the leverage pool.
	const refreshAllOrgs = async () => {
		try {
			const allOrgs = await Organizations.find({ theme: themeId }).fetchAsync()
			const aggregated = aggregateVotesByOrganization(
				memberThemes,
				settings?.useKioskFundsVoting || false,
				settings?.useKioskChitVoting || false
			)
			orgObserverParams.fundsVotesByOrg = aggregated.fundsVotesByOrg
			orgObserverParams.chitVotesByOrg = aggregated.chitVotesByOrg
			const refreshedMatching = computeMatching(allOrgs, theme, settings, memberThemes, aggregated.chitVotesByOrg)
			orgObserverParams.topOrgIds = refreshedMatching.topOrgIds
			orgObserverParams.matchedAmounts = refreshedMatching.matchedAmounts
			allOrgs.forEach(org => {
				publisher.changed("organizations", org._id, OrgTransformer(org, orgObserverParams))
			})
		} catch (error) {
			publicationLog.error(
				"organizations.refresh",
				"Failed to refresh organization publication payloads after org or pledge change",
				error,
				{ themeId, model: LogModels.Organization, mirrorToConsole: true },
			)
		}
	}
	const debouncedRefresh = createDebouncedFunction(() => { void refreshAllOrgs() }, 100)

	const wrappedObserverCallbacks = {
		added: observerCallbacks.added,
		changed: (newDoc: OrgData) => {
			debouncedRefresh()
			return observerCallbacks.changed(newDoc)
		},
		removed: (oldDoc: OrgData) => {
			debouncedRefresh()
			return observerCallbacks.removed(oldDoc)
		},
	}
	const orgsCursor = Organizations.find({ theme: themeId }).observe(wrappedObserverCallbacks)

	const refreshOrgsFromMemberThemes = async (freshMemberThemes: MemberTheme[]) => {
		try {
			memberThemes = freshMemberThemes
			orgObserverParams.memberThemes = freshMemberThemes
			await refreshAllOrgs()
		} catch (error) {
			publicationLog.error(
				"organizations.refreshFromMemberThemes",
				"Failed to refresh organization publication after memberThemes coordinator update",
				error,
				{ themeId, model: LogModels.MemberTheme, mirrorToConsole: true },
			)
		}
	}

	const unsubscribeMemberThemes = registerMemberThemesRefreshListener(themeId, freshRows => {
		void refreshOrgsFromMemberThemes(freshRows)
	})

	publisher.onStop(() => {
		debouncedRefresh.cancel()
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
