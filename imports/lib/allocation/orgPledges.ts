import { isOrgEligibleForLeverage, type PledgeMatchingTheme } from "/imports/lib/allocation/pledgeMatching"

type OrgLike = {
	pledges?: { amount?: number }[] | null
	pledgeTotal?: number
	_id: string
}

/**
 * Add up pledge amounts only (no match-from-pool bonus).
 */
export const rawPledgeTotal = (org: OrgLike): number =>
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
