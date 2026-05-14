import { Meteor } from "meteor/meteor"

import { registerObserver, type PublishSelf } from "../methods"
import { OrgTransformer, type OrgTransformerParams } from "/imports/server/transformers/orgTransformer"
import { registerMemberThemesRefreshListener } from "/imports/server/publications/memberThemesRefreshCoordinator"
import { createDebouncedFunction } from "/imports/lib/utils"
import {
	getOrgPublicationFrame,
	refreshOrgObserverParamsInPlace,
} from "/imports/server/themeDataLoaders/organizationPublicationFrame"

import {
	Organizations,
	type OrgData,
} from "/imports/api/db"
import { LogModels } from "/imports/api/db/Logs"
import { publicationLog } from "/imports/lib/loggers"
import { type MemberTheme } from "/imports/types/schema"

const orgObserver = registerObserver((doc: OrgData, params: OrgTransformerParams) => {
	if(!doc.theme) return { ...doc }

	return OrgTransformer(doc, params)
})

const publishOrganizations = async (themeId: string, publisher: PublishSelf) => {
	const frame = await getOrgPublicationFrame(themeId)
	if(!frame) {
		publisher.ready()
		return
	}

	const { orgObserverParams, initialOrgs, theme, settings } = frame
	let memberThemes = orgObserverParams.memberThemes

	const observerCallbacks = orgObserver("organizations", publisher, orgObserverParams)

	initialOrgs.forEach(org => {
		observerCallbacks.added(org)
	})

	const refreshAllOrgs = async () => {
		try {
			const allOrgs = await Organizations.find({ theme: themeId }).fetchAsync()
			refreshOrgObserverParamsInPlace(orgObserverParams, allOrgs, theme, settings, memberThemes)
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
