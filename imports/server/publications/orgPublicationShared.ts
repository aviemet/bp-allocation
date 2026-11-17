import { publicationLog } from "/imports/lib/logging"
import { registerObserver, type PublishSelf } from "../methods"
import { OrgTransformer, type OrgTransformerParams } from "/imports/server/transformers/orgTransformer"
import { registerMemberThemesRefreshListener } from "/imports/server/publications/memberThemesRefreshCoordinator"
import { createCoalescedRefresh } from "/imports/server/publications/publicationRefreshCoalesce"
import {
	recordPublicationChangedEmissions,
	recordPublicationRefreshTrigger,
	trackPublicationRefresh,
} from "/imports/server/publications/publicationRefreshMetrics"
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

const refreshMetricNameForCollection = (collectionName: string): string => {
	if(collectionName === "organizations") {
		return "organizations.refresh"
	}
	if(collectionName === "orgPledgeFunding") {
		return "orgPledgeFunding.refresh"
	}
	return `${collectionName}.refresh`
}

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
	const coalescedRefresh = createCoalescedRefresh()

	const orgObserver = registerObserver((doc: OrgData, params: OrgTransformerParams) => {
		if(!doc.theme) return { ...doc }

		return mapPublished(OrgTransformer(doc, params))
	})

	const observerCallbacks = orgObserver(collectionName, publisher, orgObserverParams)

	initialOrgs.forEach(org => {
		observerCallbacks.added(org)
	})

	const refreshMetricName = refreshMetricNameForCollection(collectionName)

	const refreshAllOrgs = async () => {
		recordPublicationRefreshTrigger(refreshMetricName)
		await trackPublicationRefresh(refreshMetricName, async () => {
			try {
				const allOrgs = await Organizations.find({ theme: themeId }).fetchAsync()
				refreshOrgObserverParamsInPlace(orgObserverParams, allOrgs, theme, settings, memberThemes)
				allOrgs.forEach(org => {
					const transformed = OrgTransformer(org, orgObserverParams)
					publisher.changed(collectionName, org._id, mapPublished(transformed))
				})
				recordPublicationChangedEmissions(refreshMetricName, allOrgs.length)
			} catch (error) {
				publicationLog.error(
					`${collectionName}.refresh`,
					"Failed to refresh organization-derived publication after org or pledge change",
					error,
					{ themeId, model: LogModels.Organization, mirrorToConsole: true },
				)
			}
		})
	}

	const scheduleRefreshAllOrgs = () => {
		coalescedRefresh.schedule(() => refreshAllOrgs())
	}

	const debouncedRefresh = createDebouncedFunction(() => {
		scheduleRefreshAllOrgs()
	}, 100)

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

	const unsubscribeMemberThemes = registerMemberThemesRefreshListener(themeId, freshRows => {
		memberThemes = freshRows
		orgObserverParams.memberThemes = freshRows
		scheduleRefreshAllOrgs()
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
