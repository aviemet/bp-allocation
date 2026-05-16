import { roundFloat } from "/imports/lib/utils"
import { pledgeTotalForOrg } from "/imports/lib/allocation/pledgeMatching"
import {
	allocatedFundsRounded,
	allocatedSumBeforeSpread,
	finalistStarts,
	needBeforeLeverageSpread,
	orgFundsVotes,
	saveAmount as saveForOrg,
} from "/imports/lib/allocation/orgFunding"

export { aggregateVotesByOrganization } from "/imports/lib/allocation/memberVotes"
import { type OrgDataWithComputed } from "/imports/api/hooks/useOrgs"
import { type MemberTheme } from "/imports/types/schema"
import { type OrgData, type ThemeData, type SettingsData } from "/imports/api/db"

export interface OrgTransformerParams {
	theme?: ThemeData
	settings?: SettingsData
	memberThemes: MemberTheme[]
	fundsVotesByOrg?: Record<string, number>
	chitVotesByOrg?: Record<string, number>
	topOrgIds?: Set<string>
	matchedAmounts?: Map<string, number>
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

export type OrgWithComputed = OrgDataWithComputed & Record<string, unknown>
/**
 * Document transformer for records in the Organization table
 * @param {Object} doc Object in iterating array of objects to altered
 * @param {Object} params { theme, settings, memberThemes }
 */
export const OrgTransformer = (doc: OrgData, params: OrgTransformerParams): OrgWithComputed => {
	const save = saveForOrg(params.theme, doc._id)

	const pledgeTotal = params.theme
		? pledgeTotalForOrg(doc, params.theme, params.matchedAmounts, params.topOrgIds)
		: 0

	const fundsVotes = orgFundsVotes(doc, params.settings, params.fundsVotesByOrg)

	const minStart = finalistStarts(params.theme, params.topOrgIds, doc._id)

	const preLeverageSum = allocatedSumBeforeSpread({
		minStart,
		fundsVotes,
		pledgeTotal,
		save,
		topOff: doc.topOff || 0,
	})
	const allocatedFunds = allocatedFundsRounded(preLeverageSum)

	const need = needBeforeLeverageSpread(preLeverageSum, doc.ask || 0)

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

	return {
		...doc,
		save,
		pledgeTotal,
		votedTotal: fundsVotes,
		allocatedFunds,
		need,
		votes: votesRounded,
		leverageFunds: doc.leverageFunds ?? 0,
		topOff: doc.topOff ?? 0,
		amountFromVotes: doc.amountFromVotes ?? 0,
		ask: doc.ask ?? 0,
	}
}
