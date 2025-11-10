import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"

import { registerObserver } from "../methods"
import { filterTopOrgs } from "/imports/lib/orgsMethods"

import { Themes, PresentationSettings, Organizations, MemberThemes, type ThemeData, type SettingsData } from "/imports/api/db"
import { initializeThemeData } from "/imports/api/stores/ThemeStore"
import { ThemeTransformer, OrgTransformer } from "/imports/server/transformers"
import { type ThemeTransformerParams } from "/imports/server/transformers/themeTransformer"

const themeObserverFactory = registerObserver((doc: ThemeData, params: ThemeTransformerParams) => {
	const transformed = ThemeTransformer(doc, params)
	return { ...transformed }
})

Meteor.publish("themes", function(themeId?: string) {
	if(themeId) {
		const observer = Themes.find({ _id: themeId }).observe({
			added: (doc) => this.added("themes", doc._id, { ...doc }),
			changed: (doc) => this.changed("themes", doc._id, { ...doc }),
			removed: (doc) => this.removed("themes", doc._id),
		})
		this.onStop(() => observer.stop())
		this.ready()
	} else {
		return Themes.find({}, { fields: { _id: 1, title: 1, createdAt: 1, slug: 1 } })
	}
})


Meteor.publish("theme", function(themeId: string) {
	if(!themeId) {
		this.ready()
		return
	}

	let themeLiveQuery: Meteor.LiveQueryHandle | null = null
	let hasCalledReady = false

	const stopThemeObserver = () => {
		if(themeLiveQuery) {
			if(typeof themeLiveQuery.stop === "function") {
				themeLiveQuery.stop()
			}
			themeLiveQuery = null
		}
	}

	const publication = this
	let isStopped = false
	const themeCursor = Themes.find({ _id: themeId })
	const memberThemesCursor = MemberThemes.find({ theme: themeId })
	const orgsCursor = Organizations.find({ theme: themeId })
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
		void refreshTheme().finally(() => {
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
		}
	}

	const refreshTheme = async () => {
		try {
			const themeDocs = await themeCursor.fetchAsync()
			if(isStopped) {
				return
			}

			const themeDoc = themeDocs[0]
			if(!themeDoc) {
				stopThemeObserver()
				if(!hasCalledReady) {
					publication.ready()
					hasCalledReady = true
				}
				return
			}

			const hydratedTheme = initializeThemeData(themeDoc)

			ensureSettingsWatcher(themeDoc.presentationSettings)

			const settingsDocs = settingsCursor ? await settingsCursor.fetchAsync() : []
			if(isStopped) {
				return
			}
			const settings = settingsDocs[0]
			if(!settings) {
				stopThemeObserver()
				if(!hasCalledReady) {
					publication.ready()
					hasCalledReady = true
				}
				return
			}

			const memberThemes = await memberThemesCursor.fetchAsync()
			if(isStopped) {
				return
			}
			const orgs = await orgsCursor.fetchAsync()
			if(isStopped) {
				return
			}

			const transformedOrgs = orgs.map(org => {
				return OrgTransformer(org, { theme: hydratedTheme, settings, memberThemes })
			})

			const topOrgs = filterTopOrgs(transformedOrgs, hydratedTheme)

			stopThemeObserver()

			themeLiveQuery = Themes.find({ _id: themeDoc._id }).observe(themeObserverFactory("themes", publication, { topOrgs, memberThemes, settings }))

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

	watchers.push(orgsCursor.observeChanges({
		added: scheduleRefresh,
		changed: scheduleRefresh,
		removed: scheduleRefresh,
	}))

	scheduleRefresh()

	this.onStop(() => {
		isStopped = true
		stopThemeObserver()
		stopSettingsWatcher()
		watchers.forEach(handle => {
			if(handle && typeof handle.stop === "function") {
				handle.stop()
			}
		})
	})
})

Meteor.publish("themeBySlug", async function(slug: string) {
	if(!slug) {
		this.ready()
		return
	}

	const themeDoc = await Themes.findOneAsync({ slug })
	if(!themeDoc) {
		this.ready()
		return
	}
	const themeId = themeDoc._id

	let themeLiveQuery: Meteor.LiveQueryHandle | null = null
	let hasCalledReady = false

	const stopThemeObserver = () => {
		if(themeLiveQuery) {
			if(typeof themeLiveQuery.stop === "function") {
				themeLiveQuery.stop()
			}
			themeLiveQuery = null
		}
	}

	const publication = this
	let isStopped = false
	const themeCursor = Themes.find({ _id: themeId })
	const memberThemesCursor = MemberThemes.find({ theme: themeId })
	const orgsCursor = Organizations.find({ theme: themeId })
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
		void refreshTheme().finally(() => {
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
		}
	}

	const refreshTheme = async () => {
		try {
			const themeDocs = await themeCursor.fetchAsync()
			if(isStopped) {
				return
			}

			const themeDocLatest = themeDocs[0]
			if(!themeDocLatest) {
				stopThemeObserver()
				if(!hasCalledReady) {
					publication.ready()
					hasCalledReady = true
				}
				return
			}

			const hydratedTheme = initializeThemeData(themeDocLatest)

			ensureSettingsWatcher(themeDocLatest.presentationSettings)

			const settingsDocs = settingsCursor ? await settingsCursor.fetchAsync() : []
			if(isStopped) {
				return
			}
			const settings = settingsDocs[0]
			if(!settings) {
				stopThemeObserver()
				if(!hasCalledReady) {
					publication.ready()
					hasCalledReady = true
				}
				return
			}

			const memberThemes = await memberThemesCursor.fetchAsync()
			if(isStopped) {
				return
			}
			const orgs = await orgsCursor.fetchAsync()
			if(isStopped) {
				return
			}

			const transformedOrgs = orgs.map(org => {
				return OrgTransformer(org, { theme: hydratedTheme, settings, memberThemes })
			})

			const topOrgs = filterTopOrgs(transformedOrgs, hydratedTheme)

			stopThemeObserver()

			themeLiveQuery = Themes.find({ _id: themeId }).observe(themeObserverFactory("themes", publication, { topOrgs, memberThemes, settings }))

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

	watchers.push(orgsCursor.observeChanges({
		added: scheduleRefresh,
		changed: scheduleRefresh,
		removed: scheduleRefresh,
	}))

	scheduleRefresh()

	this.onStop(() => {
		isStopped = true
		stopThemeObserver()
		stopSettingsWatcher()
		watchers.forEach(handle => {
			if(handle && typeof handle.stop === "function") {
				handle.stop()
			}
		})
	})
})
