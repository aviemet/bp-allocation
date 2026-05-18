import { isEmpty } from "es-toolkit/compat"

import { roundFloat } from "/imports/lib/utils"
import { type OrgData, type ThemeData, type SettingsData } from "/imports/api/db"

/**
 * Save amount from the theme's save list for one org, or 0 if none.
 */
export const saveAmount = (theme: ThemeData | undefined, organizationId: string): number => {
	if(!theme?.saves || isEmpty(theme.saves)) return 0

	const saveRecord = theme.saves.find(save => save.org === organizationId)
	return saveRecord ? (saveRecord.amount ?? 0) : 0
}

/**
 * How many dollars this org has from the funds-voting step (before pledges and match bonuses).
 * Kiosk funds: from the rolled-up map for that org.
 * Otherwise: the org's saved `amountFromVotes` field.
 */
export const orgFundsVotes = (
	doc: OrgData,
	settings: SettingsData | undefined,
	fundsVotesByOrg: Record<string, number> | undefined,
): number => {
	if(settings?.useKioskFundsVoting && fundsVotesByOrg) {
		return fundsVotesByOrg[doc._id] || 0
	}
	return doc.amountFromVotes || 0
}

/**
 * Minimum starting funds for this org if it's a top org and the theme turns that on; otherwise 0.
 */
export const finalistStarts = (
	theme: ThemeData | undefined,
	topOrganizationIds: Set<string> | undefined,
	organizationId: string,
): number => {
	const finalist = topOrganizationIds ? topOrganizationIds.has(organizationId) : true
	if(!finalist || !theme?.minStartingFundsActive) return 0
	return theme.minStartingFunds ?? 0
}

/**
 * Dollars already counting toward an org before we run the big leverage spread math:
 * min starting funds + fund votes + pledge totals + save + crowd favorite (`topOff`).
 */
export const allocatedSumBeforeSpread = (
	components: {
		minStart: number
		fundsVotes: number
		pledgeTotal: number
		save: number
		topOff: number
	},
): number =>
	components.minStart + components.fundsVotes + components.pledgeTotal + components.save + components.topOff

/**
 * Same total as `allocatedSumBeforeSpread`, rounded for what we show on the org.
 */
export const allocatedFundsRounded = (preLeverageAllocatedSum: number): number =>
	roundFloat(String(preLeverageAllocatedSum))

/**
 * How far the org is from its ask after those building blocks; 0 if already past the ask. Rounded.
 * This is the “need” on the org in the main transformer — not the same as `needDuringSpread`, which runs during the leverage-spread steps.
 */
export const needBeforeLeverageSpread = (
	preLeverageAllocatedSum: number,
	ask: number,
): number => {
	const needNumber = ask - preLeverageAllocatedSum
	return roundFloat(String(needNumber > 0 ? needNumber : 0))
}
