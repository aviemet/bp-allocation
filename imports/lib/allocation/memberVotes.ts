import { isEmpty } from "es-toolkit/compat"

import { type MemberTheme } from "/imports/types/schema"

/**
 * Adds up kiosk ballot data per organization.
 *
 * fundsVotesByOrg: dollars each org got from member fund allocations (only when kiosk fund voting).
 * chitVotesByOrg: chit votes each org got from members (only when kiosk chit voting).
 */
export function aggregateVotesByOrganization(
	memberThemes: MemberTheme[],
	useKioskFundsVoting: boolean,
	useKioskChitVoting: boolean,
): {
	fundsVotesByOrg: Record<string, number>
	chitVotesByOrg: Record<string, number>
} {
	const fundsVotesByOrg: Record<string, number> = {}
	const chitVotesByOrg: Record<string, number> = {}

	for(const memberTheme of memberThemes) {
		if(useKioskFundsVoting && memberTheme.allocations) {
			for(const allocation of memberTheme.allocations) {
				if(allocation.organization && allocation.amount) {
					fundsVotesByOrg[allocation.organization] = (fundsVotesByOrg[allocation.organization] || 0) + allocation.amount
				}
			}
		}

		if(useKioskChitVoting && memberTheme.chitVotes && !isEmpty(memberTheme.chitVotes)) {
			for(const chitVote of memberTheme.chitVotes) {
				if(chitVote.organization && chitVote.votes) {
					chitVotesByOrg[chitVote.organization] = (chitVotesByOrg[chitVote.organization] || 0) + chitVote.votes
				}
			}
		}
	}

	return { fundsVotesByOrg, chitVotesByOrg }
}

/**
 * Total kiosk fund dollars from member allocation rows (`MemberTheme.allocations`).
 *
 * Does not include manual funds on the org document (`amountFromVotes`).
 *
 * Leave off `forOrganizationId` for the whole theme; pass one org id to total only that org's allocations.
 */
export const allocationSum = (
	memberThemes: MemberTheme[],
	forOrganizationId?: string,
): number => memberThemes.reduce((sum, memberTheme) =>
	sum + (memberTheme.allocations || []).reduce((allocationSum, allocation) => {
		if(forOrganizationId && allocation.organization !== forOrganizationId) {
			return allocationSum
		}
		return allocationSum + (allocation.amount || 0)
	}, 0), 0)
