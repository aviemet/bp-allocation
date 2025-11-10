import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"

import { registerObserver } from "../methods"
import { OrgTransformer } from "/imports/server/transformers"

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
}

const orgObserver = registerObserver((doc: OrgData, params: OrgObserverParams) => {
	if(!doc.theme) return { ...doc }

	return OrgTransformer(doc, params)
})

// Organizations - All orgs for theme
Meteor.publish("organizations", function(themeId: string) {
	if(!themeId) {
		this.ready()
		return
	}

	let orgsObserver: Meteor.LiveQueryHandle | null = null
	let hasCalledReady = false

	const stopOrgObserver = () => {
		if(orgsObserver && typeof orgsObserver.stop === "function") {
			orgsObserver.stop()
		}
		orgsObserver = null
	}

	const publication = this
	let isStopped = false
	const themeCursor = Themes.find({ _id: themeId })
	const memberThemesCursor = MemberThemes.find({ theme: themeId })
	const watchers: Meteor.LiveQueryHandle[] = []
	let settingsCursor: Mongo.Cursor<SettingsData, SettingsData> | null = null
	let settingsWatcher: Meteor.LiveQueryHandle | null = null
	let monitoredSettingsId: string | undefined
	let refreshInProgress = false
	let refreshQueued = false

	const stopSettingsWatcher = () => {
		if(settingsWatcher && typeof settingsWatcher.stop === "function") {
			settingsWatcher.stop()
		}
		settingsWatcher = null
	}

	function scheduleRefresh() {
		if(isStopped) {
			return
		}
		if(refreshInProgress) {
			refreshQueued = true
			return
		}
		refreshInProgress = true
		void refreshOrganizations().finally(() => {
			refreshInProgress = false
			if(refreshQueued) {
				refreshQueued = false
				scheduleRefresh()
			}
		})
	}

	const ensureSettingsWatcher = (settingsId?: string) => {
		if(settingsId === monitoredSettingsId) {
			return
		}
		stopSettingsWatcher()
		monitoredSettingsId = settingsId
		settingsCursor = settingsId ? PresentationSettings.find({ _id: settingsId }) : null
		if(settingsCursor) {
			settingsWatcher = settingsCursor.observeChanges({
				added: scheduleRefresh,
				changed: scheduleRefresh,
				removed: scheduleRefresh,
			})
		} else {
			settingsWatcher = null
		}
	}

	const refreshOrganizations = async () => {
		try {
			const themeDocs = await themeCursor.fetchAsync()
			if(isStopped) {
				return
			}

			const theme = themeDocs[0]
			if(!theme) {
				stopOrgObserver()
				if(!hasCalledReady) {
					publication.ready()
					hasCalledReady = true
				}
				return
			}

			ensureSettingsWatcher(theme.presentationSettings)

			const settingsDocs = settingsCursor ? await settingsCursor.fetchAsync() : []
			if(isStopped) {
				return
			}
			const settings = settingsDocs[0]

			const memberThemes = await memberThemesCursor.fetchAsync()
			if(isStopped) {
				return
			}

			stopOrgObserver()

			orgsObserver = Organizations
				.find({ theme: themeId })
				.observe(orgObserver("organizations", publication, { theme, settings, memberThemes }))

			if(!hasCalledReady) {
				publication.ready()
				hasCalledReady = true
			}
		} catch (error) {
			const castError = error instanceof Error ? error : new Error(String(error))
			publication.error(castError)
		}
	}

	watchers.push(themeCursor.observeChanges({
		added: scheduleRefresh,
		changed: scheduleRefresh,
		removed: scheduleRefresh,
	}))

	watchers.push(memberThemesCursor.observeChanges({
		added: scheduleRefresh,
		changed: scheduleRefresh,
		removed: scheduleRefresh,
	}))

	scheduleRefresh()

	this.onStop(() => {
		isStopped = true
		stopOrgObserver()
		stopSettingsWatcher()
		watchers.forEach(handle => {
			if(handle && typeof handle.stop === "function") {
				handle.stop()
			}
		})
	})
})

