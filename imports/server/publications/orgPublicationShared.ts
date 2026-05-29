import { publicationLog } from "/imports/lib/logging"
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
import { type MemberTheme } from "/imports/types/schema"

export const runThemeOrgPublication = async (
	themeId: string,
	publisher: PublishSelf,
	collectionName: string,
	mapPublished: (transformed: Record<string, unknown>) => Record<string, unknown>,
): Promise<void> => {
	const frame = await getOrgPublicationFrame(themeId)
	if(!frame) {
		publisher.ready()
		return
	}

	const { orgObserverParams, initialOrgs, theme, settings } = frame
	let memberThemes = orgObserverParams.memberThemes

	const orgObserver = registerObserver((doc: OrgData, params: OrgTransformerParams) => {
		if(!doc.theme) return { ...doc }

		return mapPublished(OrgTransformer(doc, params))
	})

	const observerCallbacks = orgObserver(collectionName, publisher, orgObserverParams)

	initialOrgs.forEach(org => {
		observerCallbacks.added(org)
	})

	const refreshAllOrgs = async () => {
		try {
			const allOrgs = await Organizations.find({ theme: themeId }).fetchAsync()
			refreshOrgObserverParamsInPlace(orgObserverParams, allOrgs, theme, settings, memberThemes)
			allOrgs.forEach(org => {
				const transformed = OrgTransformer(org, orgObserverParams)
				publisher.changed(collectionName, org._id, mapPublished(transformed))
			})
		} catch (error) {
			publicationLog.error(
				`${collectionName}.refresh`,
				"Failed to refresh organization-derived publication after org or pledge change",
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
				`${collectionName}.refreshFromMemberThemes`,
				"Failed to refresh organization-derived publication after memberThemes coordinator update",
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
