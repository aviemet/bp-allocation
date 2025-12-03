import { isEmpty } from "lodash"
import { roundFloat } from "/imports/lib/utils"
import { type MemberTheme } from "/imports/types/schema"
import { type OrgData, type ThemeData, type SettingsData } from "/imports/api/db"

export interface OrgTransformerParams {
	theme?: ThemeData
	settings?: SettingsData
	memberThemes: MemberTheme[]
	fundsVotesByOrg?: Record<string, number>
	chitVotesByOrg?: Record<string, number>
	topOrgIds?: Set<string>
}

export function aggregateVotesByOrganization(memberThemes: MemberTheme[], useKioskFundsVoting: boolean, useKioskChitVoting: boolean): {
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

export function calculateVotesFromRawOrg(
	org: OrgData,
	settings: SettingsData,
	theme: ThemeData,
	chitVotesByOrg?: Record<string, number>
): number {
	let votes = 0
	if(settings.useKioskChitVoting && chitVotesByOrg) {
		votes = chitVotesByOrg[org._id] || 0
	} else if(theme && org.chitVotes) {
		if(org.chitVotes.count) {
			votes = org.chitVotes.count
		} else if(org.chitVotes.weight && theme.chitWeight) {
			votes = org.chitVotes.weight / theme.chitWeight
		}
	}
	return roundFloat(String(votes), 1)
}

export interface OrgWithComputed extends OrgData {
	save: number
	pledgeTotal: number
	votedTotal: number
	allocatedFunds: number
	need: number
	votes: number
	[key: string]: unknown
}
/**
 * Document transformer for records in the Organization table
 * @param {Object} doc Object in iterating array of objects to altered
 * @param {Object} params { theme, settings, memberThemes }
 */
const OrgTransformer = (doc: OrgData, params: OrgTransformerParams) => {
	// Get save amount if saved
	let save = 0
	if(params.theme?.saves && !isEmpty(params.theme.saves)) {
		const saveObj = params.theme.saves.find(save => save.org === doc._id)
		save = saveObj ? (saveObj.amount || 0) : 0
	}

	// Total of funds pledged for this org multiplied by the match ratio
	let pledgeTotal = 0
	if(params.theme && doc.pledges) {
		const isRunnerUp = params.topOrgIds ? !params.topOrgIds.has(doc._id) : false
		const shouldApplyLeverage = !isRunnerUp || params.theme.leverageRunnersUpPledges
		const matchRatio = shouldApplyLeverage ? (params.theme.matchRatio || 0) : 0

		pledgeTotal = doc.pledges.reduce(
			(sum, pledge) => { return sum + (pledge.amount || 0) },
			0) * matchRatio
	}

	// Voted total
	let votedTotal = 0
	if(params.settings && params.settings.useKioskFundsVoting && params.fundsVotesByOrg) {
		votedTotal = params.fundsVotesByOrg[doc._id] || 0
	} else {
		votedTotal = doc.amountFromVotes || 0
	}

	// Total amount of money allocated to this org aside from leverage distribution
	const allocatedFundsNum = votedTotal + pledgeTotal + save + (doc.topOff || 0)
	const allocatedFunds = roundFloat(String(allocatedFundsNum))

	// Amount needed to reach goal
	const needNum = (doc.ask || 0) - allocatedFundsNum
	const need = roundFloat(String(needNum > 0 ? needNum : 0))

	// Votes
	let votes = 0
	if(params.settings && params.settings.useKioskChitVoting && params.chitVotesByOrg) {
		votes = params.chitVotesByOrg[doc._id] || 0
	} else if(params.theme && doc.chitVotes) {
		if(doc.chitVotes.count) {
			votes = doc.chitVotes.count
		} else if(doc.chitVotes.weight && params.theme.chitWeight) {
			votes = doc.chitVotes.weight / params.theme.chitWeight
		}
	}
	const votesRounded = roundFloat(String(votes), 1)

	const result: OrgWithComputed = {
		...doc,
		save,
		pledgeTotal,
		votedTotal,
		allocatedFunds,
		need,
		votes: votesRounded,
	}

	return result
}

export default OrgTransformer
