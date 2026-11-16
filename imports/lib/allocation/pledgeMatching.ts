import { type ThemeData, type SettingsData } from "/imports/api/db"
import { roundFloat } from "/imports/lib/utils"
import { type MatchPledge, type MemberTheme } from "/imports/types/schema"

import { aggregateVotesByOrganization } from "./memberVotes"
import { prePledgeAllocatedBeforePledges, remainingGapToAskDuringPledgeWalk } from "./orgFunding"
import { sumTopOff } from "./orgPledges"
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
	ask?: number
	pledges?: MatchPledge[]
	topOff?: number
	amountFromVotes?: number
}

export interface MatchedPrincipalWithPoolResult {
	matchedPrincipal: number
	leverageBonus: number
	poolConsumed: number
}

export interface PledgeMatchPreview extends MatchedPrincipalWithPoolResult {
	fullMatch: boolean
	askLimited: boolean
	poolLimited: boolean
	overNeedNoMatch: boolean
	orgFullyFunded: boolean
	poolExhausted: boolean
}


export interface PledgeMatchingContext {
	consolationTotal: number
	startingFundsTotal: number
	votedFunds: number
	topOrgIds?: Set<string>
	fundsVotesByOrg?: Record<string, number>
	settings?: Pick<SettingsData, "useKioskFundsVoting">
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

export const leverageBonusCappedByAsk = (
	pledgeAmount: number,
	orgNeed: number,
	matchMultiplier: number,
): number => {
	if(orgNeed <= 0 || pledgeAmount <= 0 || matchMultiplier <= 1) return 0
	if(pledgeAmount >= orgNeed) return 0

	const remainingGap = orgNeed - pledgeAmount
	const fullMatchBonus = pledgeAmount * (matchMultiplier - 1)
	return roundFloat(String(Math.min(remainingGap, fullMatchBonus)))
}

export const matchedPrincipalWithPoolCap = (
	pledgeAmount: number,
	orgNeed: number,
	matchMultiplier: number,
	poolAvailable: number,
): MatchedPrincipalWithPoolResult => {
	if(pledgeAmount <= 0) {
		return { matchedPrincipal: 0, leverageBonus: 0, poolConsumed: 0 }
	}

	if(matchMultiplier <= 1) {
		const matchedPrincipal = roundFloat(String(pledgeAmount))
		return { matchedPrincipal, leverageBonus: 0, poolConsumed: 0 }
	}

	const askBonus = leverageBonusCappedByAsk(pledgeAmount, orgNeed, matchMultiplier)
	if(askBonus <= 0) {
		return { matchedPrincipal: 0, leverageBonus: 0, poolConsumed: 0 }
	}

	const askMatchedPrincipal = roundFloat(String(askBonus / (matchMultiplier - 1)))

	if(poolAvailable >= askBonus) {
		return {
			matchedPrincipal: askMatchedPrincipal,
			leverageBonus: askBonus,
			poolConsumed: askBonus,
		}
	}

	if(poolAvailable <= 0) {
		return { matchedPrincipal: 0, leverageBonus: 0, poolConsumed: 0 }
	}

	const leverageBonus = roundFloat(String(poolAvailable))
	const matchedPrincipal = roundFloat(String(poolAvailable / (matchMultiplier - 1)))
	return { matchedPrincipal, leverageBonus, poolConsumed: leverageBonus }
}

export interface PreviewMatchedPrincipalInput {
	pledgeAmount: number
	orgNeed: number
	matchMultiplier: number
	remainingLeverage: number
	matchEligible: boolean
}

export const previewMatchedPrincipal = ({
	pledgeAmount,
	orgNeed,
	matchMultiplier,
	remainingLeverage,
	matchEligible,
}: PreviewMatchedPrincipalInput): PledgeMatchPreview => {
	const empty: PledgeMatchPreview = {
		matchedPrincipal: 0,
		leverageBonus: 0,
		poolConsumed: 0,
		fullMatch: false,
		askLimited: false,
		poolLimited: false,
		overNeedNoMatch: false,
		orgFullyFunded: false,
		poolExhausted: false,
	}

	if(!matchEligible || pledgeAmount <= 0) return empty

	if(orgNeed > 0 && pledgeAmount >= orgNeed) {
		return { ...empty, overNeedNoMatch: true }
	}

	if(orgNeed <= 0) {
		return { ...empty, orgFullyFunded: true }
	}

	if(matchMultiplier <= 1) {
		return {
			matchedPrincipal: roundFloat(String(pledgeAmount)),
			leverageBonus: 0,
			poolConsumed: 0,
			fullMatch: true,
			askLimited: false,
			poolLimited: false,
			overNeedNoMatch: false,
			orgFullyFunded: false,
			poolExhausted: false,
		}
	}

	const askBonus = leverageBonusCappedByAsk(pledgeAmount, orgNeed, matchMultiplier)
	const fullMatchBonus = pledgeAmount * (matchMultiplier - 1)
	const { matchedPrincipal, leverageBonus, poolConsumed } = matchedPrincipalWithPoolCap(
		pledgeAmount,
		orgNeed,
		matchMultiplier,
		remainingLeverage,
	)

	const fullMatch = leverageBonus > 0 && Math.abs(leverageBonus - fullMatchBonus) < 0.01
	const poolLimited = leverageBonus > 0 && poolConsumed < askBonus - 0.01
	const askLimited = leverageBonus > 0 && leverageBonus < fullMatchBonus - 0.01 && !poolLimited
	const poolExhausted = leverageBonus <= 0 && remainingLeverage <= 0

	return {
		matchedPrincipal,
		leverageBonus,
		poolConsumed,
		fullMatch,
		askLimited,
		poolLimited,
		overNeedNoMatch: false,
		orgFullyFunded: false,
		poolExhausted,
	}
}

export const calculatePledgeMatches = (
	orgs: PledgeMatchingOrg[],
	theme: PledgeMatchingTheme,
	context: PledgeMatchingContext,
): PledgeMatchingResult => {
	const matchedAmounts = new Map<string, number>()

	const crowdFavoriteTotal = sumTopOff(orgs)
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

	const orgById = new Map(orgs.map(org => [org._id, org]))
	const prePledgeAllocated = new Map<string, number>()
	const pledgeContributionSoFar = new Map<string, number>()

	orgs.forEach(org => {
		prePledgeAllocated.set(
			org._id,
			prePledgeAllocatedBeforePledges(
				org,
				theme as ThemeData,
				context.topOrgIds,
				context.settings,
				context.fundsVotesByOrg,
			),
		)
	})

	for(const entry of pledgesInOrder) {
		const { orgId, pledge, eligibleForLeverage } = entry
		const amount = pledge.amount || 0

		if(!eligibleForLeverage) {
			matchedAmounts.set(pledge._id, 0)
			continue
		}

		const ratio = matchMultiplierForPledge(pledge, theme)
		const org = orgById.get(orgId)
		const pre = prePledgeAllocated.get(orgId) ?? 0
		const contributed = pledgeContributionSoFar.get(orgId) ?? 0
		const remainingGapToAsk = remainingGapToAskDuringPledgeWalk(org?.ask, pre, contributed)

		const { matchedPrincipal, leverageBonus, poolConsumed } = matchedPrincipalWithPoolCap(
			amount,
			remainingGapToAsk,
			ratio,
			available,
		)

		matchedAmounts.set(pledge._id, matchedPrincipal)
		available -= poolConsumed
		pledgeContributionSoFar.set(orgId, contributed + amount + leverageBonus)
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
	settings?: SettingsData,
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

	const fundsVotesByOrg = useKioskFundsVoting
		? aggregateVotesByOrganization(memberThemes, true, false).fundsVotesByOrg
		: undefined

	return calculatePledgeMatches(orgsForLeverage, theme, {
		consolationTotal: themeConsolationTotal(theme),
		startingFundsTotal: themeStartingFundsTotal(theme),
		votedFunds,
		topOrgIds,
		fundsVotesByOrg,
		settings,
	})
}
