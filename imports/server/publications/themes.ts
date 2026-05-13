import { Meteor } from "meteor/meteor"

import { registerObserver, type PublishSelf } from "../methods"
import { filterTopOrgs } from "/imports/lib/orgsMethods"
import { createDebouncedFunction } from "/imports/lib/utils"
import { computePledgeMatchingForPublication } from "/imports/lib/pledgeMatching"

import { Themes, PresentationSettings, Organizations, MemberThemes, type ThemeData } from "/imports/api/db"
import { LogModels } from "/imports/api/db/Logs"
import { publicationLog } from "/imports/lib/loggers"
import { ThemeTransformer, OrgTransformer, aggregateVotesByOrganization, calculateVotesFromRawOrg } from "/imports/server/transformers"
import { type ThemeTransformerParams } from "/imports/server/transformers/themeTransformer"
import { registerMemberThemesRefreshListener } from "/imports/server/publications/memberThemesRefreshCoordinator"
import { type MemberTheme } from "/imports/types/schema"

const themeObserver = registerObserver((doc: ThemeData, params: ThemeTransformerParams) => {
	return ThemeTransformer(doc, params)
})

const publishTheme = async (theme: ThemeData | null, publisher: PublishSelf) => {
	if(!theme) {
		publisher.ready()
		return
	}

	const settings = theme.presentationSettings ? await PresentationSettings.findOneAsync({ _id: theme.presentationSettings }) : null

	if(!settings) {
		publisher.ready()
		return
	}

	let memberThemes = await MemberThemes.find({ theme: theme._id }).fetchAsync()
	const { fundsVotesByOrg, chitVotesByOrg } = aggregateVotesByOrganization(
		memberThemes,
		settings.useKioskFundsVoting || false,
		settings.useKioskChitVoting || false
	)
	const orgs = await Organizations.find({ theme: theme._id }).fetchAsync()

	const orgsWithVotes = orgs.map(org => ({
		...org,
		votes: calculateVotesFromRawOrg(org, settings, theme, chitVotesByOrg),
	}))
	const preliminaryTopOrgs = filterTopOrgs(orgsWithVotes, theme)
	const topOrgIds = new Set(preliminaryTopOrgs.map(org => org._id))

	const pledgeMatching = computePledgeMatchingForPublication(
		orgs,
		topOrgIds,
		theme,
		settings.useKioskFundsVoting || false,
		memberThemes,
	)

	const transformedOrgs = orgs.map(org => OrgTransformer(org, { theme, settings, memberThemes, fundsVotesByOrg, chitVotesByOrg, topOrgIds, matchedAmounts: pledgeMatching.matchedAmounts }))
	const topOrgs = filterTopOrgs(transformedOrgs, theme)

	const themeObserverCallbacks = themeObserver("themes", publisher, { topOrgs, allOrgs: transformedOrgs, memberThemes, settings, pledgeMatching })
	themeObserverCallbacks.added(theme)

	const refreshThemeFromMemberThemes = async (memberThemesOverride?: MemberTheme[]) => {
		try {
			const updatedTheme = await Themes.findOneAsync({ _id: theme._id })
			if(!updatedTheme) return

			memberThemes = memberThemesOverride ?? await MemberThemes.find({ theme: theme._id }).fetchAsync()
			const { fundsVotesByOrg, chitVotesByOrg } = aggregateVotesByOrganization(
				memberThemes,
				settings.useKioskFundsVoting || false,
				settings.useKioskChitVoting || false
			)
			const updatedOrgs = await Organizations.find({ theme: theme._id }).fetchAsync()

			const updatedOrgsWithVotes = updatedOrgs.map(org => ({
				...org,
				votes: calculateVotesFromRawOrg(org, settings, updatedTheme, chitVotesByOrg),
			}))
			const updatedPreliminaryTopOrgs = filterTopOrgs(updatedOrgsWithVotes, updatedTheme)
			const updatedTopOrgIds = new Set(updatedPreliminaryTopOrgs.map(org => org._id))

			const updatedPledgeMatching = computePledgeMatchingForPublication(
				updatedOrgs,
				updatedTopOrgIds,
				updatedTheme,
				settings.useKioskFundsVoting || false,
				memberThemes,
			)

			const updatedTransformedOrgs = updatedOrgs.map(org => OrgTransformer(org, { theme: updatedTheme, settings, memberThemes, fundsVotesByOrg, chitVotesByOrg, topOrgIds: updatedTopOrgIds, matchedAmounts: updatedPledgeMatching.matchedAmounts }))
			const updatedTopOrgs = filterTopOrgs(updatedTransformedOrgs, updatedTheme)
			const transformed = ThemeTransformer(updatedTheme, { topOrgs: updatedTopOrgs, allOrgs: updatedTransformedOrgs, memberThemes, settings, pledgeMatching: updatedPledgeMatching })
			publisher.changed("themes", theme._id, transformed)
		} catch (error) {
			publicationLog.error(
				"themes.refresh",
				"Failed to refresh theme publication after memberThemes or organizations change",
				error,
				{ themeId: theme._id, model: LogModels.Theme, mirrorToConsole: true },
			)
		}
	}

	const debouncedRefresh = createDebouncedFunction(() => {
		void refreshThemeFromMemberThemes()
	}, 100)

	const unsubscribeMemberThemesCoordinator = registerMemberThemesRefreshListener(theme._id, freshRows => {
		void refreshThemeFromMemberThemes(freshRows)
	})

	const themeObserverHandle = Themes.find({ _id: theme._id }).observe({
		added: themeObserverCallbacks.added,
		changed: () => {
			debouncedRefresh()
		},
		removed: themeObserverCallbacks.removed,
	})

	const organizationsWatcher = Organizations.find({ theme: theme._id }).observeChanges({
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
		unsubscribeMemberThemesCoordinator()
		if(themeObserverHandle && typeof themeObserverHandle.stop === "function") {
			themeObserverHandle.stop()
		}
		if(organizationsWatcher && typeof organizationsWatcher.stop === "function") {
			organizationsWatcher.stop()
		}
	})

	publisher.ready()
}

Meteor.publish("themes", async function(themeId?: string) {
	let themes

	if(themeId) {
		themes = await Themes.find({ _id: themeId }).fetchAsync()
	} else {
		themes = await Themes.find({}, { fields: { _id: 1, title: 1, createdAt: 1, slug: 1 } }).fetchAsync()
	}

	themes.forEach(theme => {
		this.added("themes", theme._id, theme as unknown as Record<string, unknown>)
	})

	const query = themeId ? { _id: themeId } : {}
	const fields = themeId ? undefined : { _id: 1, title: 1, createdAt: 1, slug: 1 }
	const observer = Themes.find(query, fields ? { fields } : {}).observe({
		added: (doc) => {
			this.added("themes", doc._id, doc as unknown as Record<string, unknown>)
		},
		changed: (doc) => {
			this.changed("themes", doc._id, doc as unknown as Record<string, unknown>)
		},
		removed: (doc) => {
			this.removed("themes", doc._id)
		},
	})

	this.onStop(() => {
		if(observer && typeof observer.stop === "function") {
			observer.stop()
		}
	})
	this.ready()
})

Meteor.publish("theme", async function(themeId: string) {
	const theme = await Themes.findOneAsync({ _id: themeId })
	await publishTheme(theme || null, this)
})

Meteor.publish("themeBySlug", async function(slug: string) {
	const theme = await Themes.findOneAsync({ slug })
	await publishTheme(theme || null, this)
})
