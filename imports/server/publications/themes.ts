import { Meteor } from "meteor/meteor"

import { registerObserver, type PublishSelf } from "../methods"
import { filterTopOrgs } from "/imports/lib/orgsMethods"
import { createDebouncedFunction } from "/imports/lib/utils"

import { Themes, PresentationSettings, Organizations, MemberThemes, type ThemeData } from "/imports/api/db"
import { ThemeTransformer, OrgTransformer, aggregateVotesByOrganization } from "/imports/server/transformers"
import { type ThemeTransformerParams } from "/imports/server/transformers/themeTransformer"

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
	const transformedOrgs = orgs.map(org => OrgTransformer(org, { theme, settings, memberThemes, fundsVotesByOrg, chitVotesByOrg }))
	const topOrgs = filterTopOrgs(transformedOrgs, theme)

	const themeObserverHandle = Themes.find({ _id: theme._id }).observe(themeObserver("themes", publisher, { topOrgs, memberThemes, settings }))

	const refreshThemeFromMemberThemes = async () => {
		try {
			memberThemes = await MemberThemes.find({ theme: theme._id }).fetchAsync()
			const { fundsVotesByOrg, chitVotesByOrg } = aggregateVotesByOrganization(
				memberThemes,
				settings.useKioskFundsVoting || false,
				settings.useKioskChitVoting || false
			)
			const updatedOrgs = await Organizations.find({ theme: theme._id }).fetchAsync()
			const updatedTransformedOrgs = updatedOrgs.map(org => OrgTransformer(org, { theme, settings, memberThemes, fundsVotesByOrg, chitVotesByOrg }))
			const updatedTopOrgs = filterTopOrgs(updatedTransformedOrgs, theme)
			const transformed = ThemeTransformer(theme, { topOrgs: updatedTopOrgs, memberThemes, settings })
			publisher.changed("themes", theme._id, transformed)
		} catch (_error) {
			// Error refreshing theme from memberThemes
		}
	}

	const debouncedRefresh = createDebouncedFunction(refreshThemeFromMemberThemes, 100)

	const memberThemesWatcher = MemberThemes.find({ theme: theme._id }).observeChanges({
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
		if(themeObserverHandle && typeof themeObserverHandle.stop === "function") {
			themeObserverHandle.stop()
		}
		if(memberThemesWatcher && typeof memberThemesWatcher.stop === "function") {
			memberThemesWatcher.stop()
		}
	})

	publisher.ready()
}

Meteor.publish("themes", function(themeId?: string) {
	if(themeId) {
		return Themes.find({ _id: themeId })
	} else {
		return Themes.find({}, { fields: { _id: 1, title: 1, createdAt: 1, slug: 1 } })
	}
})

Meteor.publish("theme", async function(themeId: string) {
	const theme = await Themes.findOneAsync({ _id: themeId })
	await publishTheme(theme || null, this)
})

Meteor.publish("themeBySlug", async function(slug: string) {
	const theme = await Themes.findOneAsync({ slug })
	await publishTheme(theme || null, this)
})
