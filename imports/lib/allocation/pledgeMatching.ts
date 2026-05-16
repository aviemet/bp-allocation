import { roundFloat } from "/imports/lib/utils"
import { type MatchPledge, type MemberTheme } from "/imports/types/schema"

import { consolationTotal as themeConsolationTotal, startingFundsTotal as themeStartingFundsTotal } from "./themeTotals"

export interface PledgeMatchingResult {
	matchedAmounts: Map<string, number>
	remainingLeverage: number
}

export interface PledgeMatchingTheme {
	matchRatio?: number
	inPersonMatchRatio?: number
	leverageTotal?: number
	leverageRunnersUpPledges?: boolean
	allowRunnersUpPledges?: boolean
	numTopOrgs?: number
	organizations?: string[]
	consolationActive?: boolean
	consolationAmount?: number
	minStartingFundsActive?: boolean
	minStartingFunds?: number
}

export interface PledgeMatchingOrg {
	_id: string
	pledges?: MatchPledge[]
	topOff?: number
	amountFromVotes?: number
}

export interface PledgeMatchingContext {
	consolationTotal: number
	startingFundsTotal: number
	votedFunds: number
	topOrgIds?: Set<string>
}

export const matchMultiplierForPledge = (pledge: MatchPledge, theme: PledgeMatchingTheme): number => {
	if(pledge.pledgeType === "inPerson") {
		return theme.inPersonMatchRatio || 0
	}
	return theme.matchRatio || 0
}

export const formatMatchRatioFromMultiplier = (totalMultiplier: number): string =>
	`${Math.max(0, totalMultiplier - 1)}:1`

/**
 * Whether an org's pledges are eligible to draw from the leverage pool. Finalists
 * are always eligible; runners-up only when `theme.leverageRunnersUpPledges` is true.
 * When `topOrgIds` is omitted, all orgs are treated as finalists.
 */
export const isOrgEligibleForLeverage = (
	orgId: string,
	theme: PledgeMatchingTheme,
	topOrgIds?: Set<string>,
): boolean => {
	const isRunnerUp = topOrgIds ? !topOrgIds.has(orgId) : false
	return !isRunnerUp || !!theme.leverageRunnersUpPledges
}

export const calculatePledgeMatches = (
	orgs: PledgeMatchingOrg[],
	theme: PledgeMatchingTheme,
	context: PledgeMatchingContext,
): PledgeMatchingResult => {
	const matchedAmounts = new Map<string, number>()

	const crowdFavoriteTotal = orgs.reduce((sum, org) => sum + (org.topOff || 0), 0)
	let available = (theme.leverageTotal || 0)
		- context.consolationTotal
		- context.startingFundsTotal
		- context.votedFunds
		- crowdFavoriteTotal

	const pledgesInOrder: { orgId: string, pledge: MatchPledge, eligibleForLeverage: boolean }[] = []
	orgs.forEach(org => {
		if(!org.pledges || org.pledges.length === 0) return
		const eligibleForLeverage = isOrgEligibleForLeverage(org._id, theme, context.topOrgIds)
		org.pledges.forEach(pledge => {
			pledgesInOrder.push({ orgId: org._id, pledge, eligibleForLeverage })
		})
	})

	pledgesInOrder.sort((a, b) => {
		const aTime = a.pledge.createdAt ? a.pledge.createdAt.getTime() : 0
		const bTime = b.pledge.createdAt ? b.pledge.createdAt.getTime() : 0
		if(aTime !== bTime) return aTime - bTime
		return a.pledge._id.localeCompare(b.pledge._id)
	})

	for(const entry of pledgesInOrder) {
		const { pledge, eligibleForLeverage } = entry
		const amount = pledge.amount || 0

		if(!eligibleForLeverage) {
			matchedAmounts.set(pledge._id, 0)
			continue
		}

		const ratio = matchMultiplierForPledge(pledge, theme)

		if(ratio <= 1) {
			matchedAmounts.set(pledge._id, amount)
			continue
		}

		const required = amount * (ratio - 1)

		if(available >= required) {
			matchedAmounts.set(pledge._id, amount)
			available -= required
		} else if(available <= 0) {
			matchedAmounts.set(pledge._id, 0)
		} else {
			const matched = roundFloat(String(available / (ratio - 1)))
			matchedAmounts.set(pledge._id, matched)
			available = 0
		}
	}

	const remainingLeverage = available <= 0 ? 0 : roundFloat(String(available))

	return { matchedAmounts, remainingLeverage }
}

export const leverageBonusForPledge = (
	pledge: MatchPledge,
	matchedAmount: number,
	theme: PledgeMatchingTheme,
): number => {
	const ratio = matchMultiplierForPledge(pledge, theme)
	if(ratio <= 1) return 0
	return matchedAmount * (ratio - 1)
}

/**
 * Total contribution from one org's pledges = each pledge's raw amount + leverage
 * bonus on the matched portion. `matchedAmounts` is the per-pledge truncation map
 * produced by `calculatePledgeMatches`; when absent (standalone use, tests), each
 * pledge is assumed to be fully matched, preserving the legacy `amount * matchRatio`
 * shape. Returns 0 for runner-up orgs that aren't eligible for leverage matching.
 */
export const pledgeTotalForOrg = (
	org: PledgeMatchingOrg,
	theme: PledgeMatchingTheme,
	matchedAmounts: Map<string, number> | undefined,
	topOrgIds?: Set<string>,
): number => {
	if(!org.pledges || org.pledges.length === 0) return 0
	if(!isOrgEligibleForLeverage(org._id, theme, topOrgIds)) return 0

	return org.pledges.reduce((sum, pledge) => {
		const amount = pledge.amount || 0
		const matched = matchedAmounts === undefined
			? amount
			: matchedAmounts.get(pledge._id) ?? 0
		return sum + amount + leverageBonusForPledge(pledge, matched, theme)
	}, 0)
}

/**
 * Dollar total from funds voting used when slicing the pledge pool: kiosk adds everyone's allocations; manual adds fund votes only for orgs in `topOrgIds`.
 */
export const votedFundsForPool = (
	useKioskFundsVoting: boolean,
	memberThemes: MemberTheme[],
	rawOrgs: ReadonlyArray<PledgeMatchingOrg>,
	topOrgIds: Set<string>,
): number =>
	useKioskFundsVoting
		? memberThemes.reduce((sum, memberTheme) =>
			sum + (memberTheme.allocations || []).reduce((inner, allocation) => inner + (allocation.amount || 0), 0), 0)
		: rawOrgs.reduce(
			(sum, orgRow) =>
				topOrgIds.has(orgRow._id)
					? sum + (orgRow.amountFromVotes || 0)
					: sum,
			0,
		)

/**
 * Builds consolation, starting funds, and fund-vote totals, then runs `calculatePledgeMatches` once (what subscriptions use).
 */
export const computePledgeMatchingForPublication = (
	rawOrgs: PledgeMatchingOrg[],
	topOrgIds: Set<string>,
	theme: PledgeMatchingTheme,
	useKioskFundsVoting: boolean,
	memberThemes: MemberTheme[],
): PledgeMatchingResult => {
	const votedFunds = votedFundsForPool(
		useKioskFundsVoting,
		memberThemes,
		rawOrgs,
		topOrgIds,
	)

	const orgsForLeverage = theme.allowRunnersUpPledges
		? rawOrgs
		: rawOrgs.filter(org => topOrgIds.has(org._id))

	return calculatePledgeMatches(orgsForLeverage, theme, {
		consolationTotal: themeConsolationTotal(theme),
		startingFundsTotal: themeStartingFundsTotal(theme),
		votedFunds,
		topOrgIds,
	})
}
