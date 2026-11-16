import { isOrgEligibleForLeverage, type PledgeMatchingTheme } from "/imports/lib/allocation/pledgeMatching"

type OrgPledgeSlice = {
	pledges?: { amount?: number }[] | null
}

type OrgLike = OrgPledgeSlice & {
	pledgeTotal?: number
	_id: string
}

/**
 * Add up pledge amounts only (no match-from-pool bonus).
 */
export const rawPledgeTotal = (org: OrgPledgeSlice): number =>
	org.pledges?.reduce((sum, pledge) => sum + (pledge.amount ?? 0), 0) ?? 0

/**
 * Match-from-pool dollars on the org: full pledge contribution minus raw pledge sums, when that org qualifies for pool match. Otherwise 0.
 */
export const poolMatch = (
	org: OrgLike,
	theme: PledgeMatchingTheme,
	topOrganizationIds: Set<string>,
): number =>
	isOrgEligibleForLeverage(org._id, theme, topOrganizationIds)
		? Math.max(0, (org.pledgeTotal ?? 0) - rawPledgeTotal(org))
		: 0

type OrgTopOffSlice = {
	topOff?: number
}

export const sumTopOff = (orgs: ReadonlyArray<OrgTopOffSlice>): number =>
	orgs.reduce((sum, org) => sum + (org.topOff ?? 0), 0)

export const sumRawPledgeTotal = (orgs: ReadonlyArray<OrgPledgeSlice>): number =>
	orgs.reduce((sum, org) => sum + rawPledgeTotal(org), 0)
