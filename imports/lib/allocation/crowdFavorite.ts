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

export interface CrowdFavoriteInput {
	org: OrgData & PledgeMatchingOrg
	rawOrgs: Array<OrgData & PledgeMatchingOrg>
	theme: ThemeData & PledgeMatchingTheme
	useKioskFundsVoting: boolean
	memberThemes: MemberTheme[]
}

/**
 * Crowd favorite `topOff` before you round and save: how much fills the gap to `ask` after votes, save,
 * starting funds, and pledges, capped by what's left in the pledge pool.
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
	const startingFunds = theme.minStartingFundsActive
		? (theme.minStartingFunds ?? 0)
		: 0

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
