import { OrgTransformer } from "/imports/server/transformers/orgTransformer"
import { ThemeTransformer } from "/imports/server/transformers/themeTransformer"
import { computePledgeMatchingForPublication } from "/imports/lib/allocation/pledgeMatching"
import { filterTopOrgs } from "/imports/lib/allocation/orgsMethods"
import { getOrgPublicationFrame } from "/imports/server/themeDataLoaders/organizationPublicationFrame"
import { type OrgsListSnapshot } from "/imports/api/methods/staticReadCalls"
import { type PledgeWithOrg } from "/imports/types/themeWithComputed"

export async function fetchOrgsSnapshot(themeId: string): Promise<OrgsListSnapshot | null> {
	const frame = await getOrgPublicationFrame(themeId)
	if(!frame) {
		return null
	}

	const { orgObserverParams, initialOrgs, theme, settings } = frame
	const orgs = initialOrgs.map(org => OrgTransformer(org, orgObserverParams))
	const topOrgs = filterTopOrgs(orgs, theme)

	let pledges: PledgeWithOrg[] = []
	if(settings) {
		const topOrgIdsForMatching = orgObserverParams.topOrgIds ?? new Set<string>()
		const pledgeMatching = computePledgeMatchingForPublication(
			initialOrgs,
			topOrgIdsForMatching,
			theme,
			settings.useKioskFundsVoting || false,
			orgObserverParams.memberThemes,
		)
		const themeComputed = ThemeTransformer(theme, {
			topOrgs,
			allOrgs: orgs,
			memberThemes: orgObserverParams.memberThemes,
			settings,
			pledgeMatching,
		})
		pledges = themeComputed.pledges
	}

	return { orgs, topOrgs, pledges }
}
