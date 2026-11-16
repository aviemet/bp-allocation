/** Small helpers for numbers we show on screens after the org transform. */

import { roundFloat } from "/imports/lib/utils"

export interface OverviewAllocatedOrgSlice {
	_id: string
	allocatedFunds: number
	leverageFunds: number
}

export interface OverviewConsolationThemeSlice {
	consolationActive?: boolean
	consolationAmount?: number
}

/**
 * Total funded so far from the org row: allocated dollars plus leverage spread dollars.
 */
export const fundedTotal = (allocatedFunds: number, leverageFunds: number): number =>
	allocatedFunds + leverageFunds

export const overviewConsolationAmount = (
	isTopOrg: boolean,
	theme: OverviewConsolationThemeSlice,
): number =>
	isTopOrg ? 0 : (theme.consolationActive ? (theme.consolationAmount ?? 0) : 0)

/**
 * Admin overview "Total Allocated" column per org: funded total plus consolation for non-top orgs.
 */
export const overviewAllocatedTotal = (
	org: Pick<OverviewAllocatedOrgSlice, "allocatedFunds" | "leverageFunds">,
	theme: OverviewConsolationThemeSlice,
	isTopOrg: boolean,
): number =>
	fundedTotal(org.allocatedFunds, org.leverageFunds) + overviewConsolationAmount(isTopOrg, theme)

export const sumOverviewAllocatedTotal = (
	orgs: ReadonlyArray<OverviewAllocatedOrgSlice>,
	theme: OverviewConsolationThemeSlice,
	topOrgIds: Set<string>,
): number =>
	orgs.reduce(
		(sum, org) => sum + overviewAllocatedTotal(org, theme, topOrgIds.has(org._id)),
		0,
	)

export const sumOverviewChitVotes = (
	orgs: ReadonlyArray<{ votes?: number }>,
): number =>
	roundFloat(orgs.reduce((sum, org) => sum + (org.votes ?? 0), 0), 1)

export const sumOverviewVotedTotal = (
	orgs: ReadonlyArray<{ votedTotal?: number }>,
): number =>
	orgs.reduce((sum, org) => sum + (org.votedTotal ?? 0), 0)

export const sumOverviewConsolationTotal = (
	orgs: ReadonlyArray<OverviewAllocatedOrgSlice>,
	theme: OverviewConsolationThemeSlice,
	topOrgIds: Set<string>,
): number =>
	orgs.reduce(
		(sum, org) => sum + overviewConsolationAmount(topOrgIds.has(org._id), theme),
		0,
	)

/**
 * For the presentation graph: transformer `need` minus leverage already applied step by step.
 */
export const residualNeed = (need: number, leverageFunds?: number): number =>
	need - (leverageFunds ?? 0)
