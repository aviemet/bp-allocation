import { isEmpty } from "lodash"
import { roundFloat } from "/imports/lib/utils"

/**
 * Document transformer for records in the Organization table
 * @param {Ojbect} doc Object in iterating array of objects to altered
 * @param {Object} params { theme, settings, memberThemes }
 */
const OrgTransformer = (doc, params) => {
	doc.save = function() {
		// Get save amount if saved
		let save = 0
		if(params.theme && !isEmpty(params.theme.saves)) {
			save = (() => {
				let saveObj = params.theme.saves.find( save => save.org === doc._id)
				return saveObj ? (saveObj.amount || 0) : 0
			})()
		}
		return save
	}()

	doc.pledgeTotal = function() {
		// Total of funds pledged for this org multiplied by the match ratio
		let pledgeTotal = 0
		if(params.theme && doc.pledges) {
			pledgeTotal = doc.pledges.reduce((sum, pledge) => { return sum + pledge.amount }, 0) * params.theme.matchRatio
		}
		return pledgeTotal
	}()

	doc.votedTotal = function() {
		// If voting with kiosk mode, get votes for this org from each member
		if(params.settings && params.settings.useKioskFundsVoting) {
			const amount = params.memberThemes.reduce((sum, memberTheme) => {
				const vote = memberTheme.allocations.find(allocation => allocation.organization === doc._id)
				return sum + (vote ? vote.amount : 0)
			}, 0)
			return amount
		}
		return doc.amountFromVotes
	}()

	doc.allocatedFunds = function() {
		// Total amount of money allocted to this org aside from leverage distribution
		return roundFloat((doc.votedTotal || 0) + doc.pledgeTotal + doc.save + doc.topOff)
	}()

	doc.need = function() {
		// Amount needed to reach goal
		let need = doc.ask - doc.allocatedFunds
		return roundFloat(need > 0 ? need : 0)
	}()

	doc.votes = function() {
		let votes = 0

		// If chit voting by kiosk, get chit votes for this org from each member
		if(params.settings && params.settings.useKioskChitVoting) {
			votes = params.memberThemes.reduce((sum, memberTheme) => {
				if(!isEmpty(memberTheme.chitVotes)) {
					const vote = memberTheme.chitVotes.find(chit => chit.organization === doc._id)
					return sum + (vote ? vote.votes : 0)
				}
				return sum
			}, 0)
		} else if(params.theme && doc.chitVotes) {
			if(doc.chitVotes.count) {
				// Token count has higher specificity, therefor higher precedence
				// If present, return this number
				votes = doc.chitVotes.count
			} else if(doc.chitVotes.weight) {
				// Token weight must be set in params.theme settings
				votes = doc.chitVotes.weight / params.theme.chitWeight
			}
		}

		return roundFloat(votes, 1)
	}()

	return doc
}

export default OrgTransformer
