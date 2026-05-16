import { allocationSum } from "./memberVotes"
import { saveAmount as saveForOrg } from "./orgFunding"
import {
	calculatePledgeMatches,
	pledgeTotalForOrg,
	type PledgeMatchingOrg,
	type PledgeMatchingTheme,
} from "./pledgeMatching"
import { consolationTotal, startingFundsTotal } from "./themeTotals"

import { type OrgData, type ThemeData } from "/imports/api/db"
import { type MemberTheme } from "/imports/types/schema"

/** What you pass into `crowdFavoriteTopOff`: the org, everyone in the theme, theme + settings shape, whether kiosk funds voting, and member themes if kiosk. */
export interface CrowdFavoriteInput {
	org: OrgData & PledgeMatchingOrg
	rawOrgs: Array<OrgData & PledgeMatchingOrg>
	theme: ThemeData & PledgeMatchingTheme
	useKioskFundsVoting: boolean
	memberThemes: MemberTheme[]
}

/**
 * Crowd favorite `topOff` before you round and save: how much fills the gap to `ask` after votes, save, starting funds, and pledges, capped by what's left in the pledge pool.
 *
 * Uses the same crowd-favorite rules as before: no `topOrgIds` on the pool walk, non-kiosk pool input adds every org's fund votes, this org's existing `topOff` is treated as 0 for that pass.
 */
export const crowdFavoriteTopOff = ({
	org,
	rawOrgs,
	theme,
	useKioskFundsVoting,
	memberThemes,
}: CrowdFavoriteInput): number => {
	const votedFunds = useKioskFundsVoting
		? allocationSum(memberThemes)
		: rawOrgs.reduce((sum, rawOrgRow) => sum + (rawOrgRow.amountFromVotes || 0), 0)
	const votedTotal = useKioskFundsVoting
		? allocationSum(memberThemes, org._id)
		: (org.amountFromVotes || 0)

	const save = saveForOrg(theme, org._id)
	const startingFunds = theme.minStartingFundsActive ? (theme.minStartingFunds ?? 0) : 0

	const orgRowsForPool = rawOrgs.map(rawOrgRow =>
		rawOrgRow._id === org._id ? { ...rawOrgRow, topOff: 0 } : rawOrgRow,
	)

	const { matchedAmounts, remainingLeverage } = calculatePledgeMatches(orgRowsForPool, theme, {
		consolationTotal: consolationTotal(theme),
		startingFundsTotal: startingFundsTotal(theme),
		votedFunds,
	})
	const pledgeContribution = pledgeTotalForOrg(org, theme, matchedAmounts)

	const gap = Math.max(0,
		(org.ask ?? 0) - votedTotal - save - startingFunds - pledgeContribution)
	return Math.min(gap, remainingLeverage > 0 ? remainingLeverage : 0)
}
