import { isEmpty } from "lodash"
import { roundFloat } from "/imports/lib/utils"
import { type MemberTheme, type ChitVote } from "/imports/types/schema"
import { type OrgData, type ThemeData, type SettingsData } from "/imports/api/db"

export interface OrgTransformerParams {
	theme?: ThemeData
	settings?: SettingsData
	memberThemes: MemberTheme[]
}

type ChitVoteLike = ChitVote | { count?: number, weight?: number } | undefined

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
const OrgTransformer = (doc: OrgWithComputed, params: OrgTransformerParams): OrgWithComputed => {
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
		// If voting with kiosk mode, get votes for this org from each member
		if(params.settings && params.settings.useKioskFundsVoting) {
			const amount = params.memberThemes.reduce((sum, memberTheme) => {
				const vote = memberTheme.allocations?.find(allocation => allocation.organization === doc._id)
				return sum + (vote && vote.amount ? vote.amount : 0)
			}, 0)
			return amount
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

		// If chit voting by kiosk, get chit votes for this org from each member
		if(params.settings && params.settings.useKioskChitVoting) {
			votes = params.memberThemes.reduce((sum, memberTheme) => {
				if(!isEmpty(memberTheme.chitVotes)) {
					const vote = memberTheme.chitVotes?.find(chit => chit.organization === doc._id)
					return sum + (vote && vote.votes ? vote.votes : 0)
				}
				return sum
			}, 0)
		} else if(params.theme && doc.chitVotes) {
			const chit: ChitVoteLike = doc.chitVotes as unknown as ChitVoteLike
			if(typeof chit === "object" && chit !== null && "count" in chit && typeof chit.count === "number") {
				// Token count has higher specificity, therefor higher precedence
				// If present, return this number
				votes = chit.count
			} else if(typeof chit === "object" && chit !== null && "weight" in chit && typeof chit.weight === "number") {
				// Token weight must be set in params.theme settings
				votes = chit.weight / ((params.theme.chitWeight || 1))
			}
		}

		return roundFloat(String(votes), 1)
	}()

	return doc
}

export default OrgTransformer
