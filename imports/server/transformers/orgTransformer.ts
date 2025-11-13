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

export interface OrgWithComputed extends OrgData {
	save?: number
	pledgeTotal?: number
	votedTotal?: number
	allocatedFunds?: number
	need?: number
	votes?: number
}
/**
 * Document transformer for records in the Organization table
 * @param {Object} doc Object in iterating array of objects to altered
 * @param {Object} params { theme, settings, memberThemes }
 */
const OrgTransformer = (doc: OrgWithComputed, params: OrgTransformerParams) => {
	doc.save = function() {
		// Get save amount if saved
		let save = 0
		if(params.theme && !isEmpty(params.theme.saves)) {
			save = (() => {
				let saveObj = params?.theme?.saves?.find( save => save.org === doc._id)
				return saveObj ? (saveObj.amount || 0) : 0
			})()
		}
		return save
	}()

	doc.pledgeTotal = function() {
		// Total of funds pledged for this org multiplied by the match ratio
		let pledgeTotal = 0
		if(params.theme && doc.pledges) {
			pledgeTotal = doc.pledges.reduce(
				(sum, pledge) => { return sum + (pledge.amount || 0) },
				0) * (params.theme.matchRatio || 0)
		}
		return pledgeTotal
	}()

	doc.votedTotal = function() {
		if(params.settings && params.settings.useKioskFundsVoting && params.fundsVotesByOrg) {
			return params.fundsVotesByOrg[doc._id] || 0
		}
		return doc.amountFromVotes
	}()

	doc.allocatedFunds = function() {
		// Total amount of money allocted to this org aside from leverage distribution
		const total = (doc.votedTotal || 0) + (doc.pledgeTotal || 0) + (doc.save || 0) + (doc.topOff || 0)
		return roundFloat(String(total))
	}()

	doc.need = function() {
		// Amount needed to reach goal
		let need = (doc.ask || 0) - (doc.allocatedFunds || 0)
		return roundFloat(String(need > 0 ? need : 0))
	}()

	doc.votes = function() {
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

		return roundFloat(String(votes), 1)
	}()

	return doc
}

export default OrgTransformer
