import { isEmpty } from "lodash"
import { roundFloat } from "/imports/lib/utils"

import { type ThemeData, type SettingsData } from "/imports/api/db"
import { type MemberTheme } from "/imports/types/schema"
import { type OrgWithComputed } from "./orgTransformer"

/**
 * Document transformer for records in the Theme table
 * @param {Object} doc Object in iterating array of objects to altered
 * @param {Object} params { topOrgs, memberThemes, settings }
 */
export interface ThemeTransformerParams {
	topOrgs: OrgWithComputed[]
	memberThemes: MemberTheme[]
	settings: SettingsData
}

export interface ThemeWithComputed extends ThemeData {
	pledgedTotal?: number
	votedFunds?: number
	fundsVotesCast?: number
	chitVotesCast?: number
	totalChitVotes?: number
	totalMembers?: number
	fundsVotingStarted?: boolean
	chitVotingStarted?: boolean
	leverageRemaining?: number
	memberFunds?: number
	consolationTotal?: number
}

const ThemeTransformer = (doc: ThemeWithComputed, params: ThemeTransformerParams) => {
	doc.pledgedTotal = function() {
		let total = 0
		params.topOrgs.map(org => {
			if(org.pledges) {
				total += org.pledges.reduce((sum, pledge) => { return sum + (pledge.amount || 0) }, 0)
			}
		})
		return total
	}()

	/**
	* Total amount of dollar votes
	*/
	doc.votedFunds = function() {
		let voteAllocated = 0

		// Calculate based on individual votes if using kiosk method
		if(params.settings.useKioskFundsVoting) {
			params.memberThemes.map(member => {
				voteAllocated += (member.allocations || []).reduce((sum, allocation) => { return (allocation.amount || 0) + sum }, 0)
			})
		// Calculate total count if not using kiosk method
		} else {
			voteAllocated = params.topOrgs.reduce((sum, org) => {
				return sum + Number(org.votedTotal || 0)
			}, voteAllocated)
		}
		return voteAllocated
	}()

	/**
	 * Total amount of members who have voted their funds
	 */
	doc.fundsVotesCast = function() {
		if(!params.settings.useKioskFundsVoting) return

		return params.memberThemes.reduce((sum, member) => {
			return member.allocations && member.allocations.length > 0 ? sum + 1 : sum
		}, 0)
	}()

	/**
	 * Total amount of members who have voted their chits
	 */
	doc.chitVotesCast = function() {
		if(!params.settings.useKioskChitVoting) return

		return params.memberThemes.reduce((sum, member) => {
			return member.chitVotes && member.chitVotes.length > 0 ? sum + 1 : sum
		}, 0)
	}()

	/**
	 * Total amount of chits to be voted
	 */
	doc.totalChitVotes = function() {
		if(!params.settings.useKioskChitVoting) return

		return params.memberThemes.reduce((sum, member) => {
			return member.chits ? sum + member.chits : sum
		}, 0)
	}()

	/**
	 * Total amount of members voting in this theme
	 */
	doc.totalMembers = function() {
		return params.memberThemes.length
	}()

	/**
	 * Whether voting has begun
	 * True if at least one person has cast a vote
	 */
	doc.fundsVotingStarted = function() {
		return params.memberThemes.some(member => {
			return (member.allocations || []).some(vote => (vote.amount || 0) > 0)
		})
	}()

	/**
	 * Whether voting has begun
	 * True if at least one person has cast a vote
	 */
	doc.chitVotingStarted = function() {
		return params.memberThemes.some(member => {
			return (member.chitVotes || []).some(vote => (vote.votes || 0) > 0)
		})
	}()


	/**
	* Amount given to orgs other than top orgs
	*/
	doc.consolationTotal = function() {
		if(doc.consolationActive) {
			const orgsCount = (doc.organizations ? doc.organizations.length : 0)
			const numTop = doc.numTopOrgs || 0
			const consolation = doc.consolationAmount || 0
			return (orgsCount - numTop) * consolation
		}

		return 0
	}()

	/**
	* Amount of the total pot still unassigned
	*   Total Pot
	* - Consolation
	* - Member Votes
	* - Crowd Favorite Topoff
	* - Matched Pledges
	* = leverageRemaining
	*/
	doc.leverageRemaining = function() {
		// Leverage moving forward into allocation round
		let remainingLeverage = (doc.leverageTotal || 0) - (doc.consolationTotal as number || 0) - (doc.votedFunds || 0)

		// Subtract the amounts allocated to each org
		params.topOrgs.map((org) => {
			// The topoff for the crowd favorite
			if((org.topOff || 0) > 0) {
				remainingLeverage -= (org.topOff || 0)
			}

			// Individual pledges from members
			if(org.pledges && !isEmpty(org.pledges)) {
				remainingLeverage -= org.pledges.reduce((sum, pledge) => {
					const amount = pledge.amount || 0
					const matchRatio = doc.matchRatio || 0
					return sum + (((amount * matchRatio) - amount))
				}, 0)
			}
		})

		if(remainingLeverage <= 0) return 0
		return roundFloat(String(remainingLeverage))
	}()

	doc.memberFunds = params.memberThemes.reduce((sum, member) => { return sum + (member.amount || 0) }, 0)

	return doc
}

export default ThemeTransformer
