import _ from "lodash"

import { roundFloat } from "/imports/lib/utils"
import { Organization } from "../types/schema"

interface OrganizationWithFunding extends Organization {
	save?: number
	pledgeTotal?: number
	allocatedFunds?: number
	need?: number
	leverageFunds?: number
	roundFunds?: number
	percent?: number
}

interface RoundTracker {
	newSumRemainingOrgs: number
	givenThisRound: number
}

export interface LeverageRound {
	leverageRemaining: number
	sumRemainingOrgs: number
	orgs: OrganizationWithFunding[]
}

class Leverage {
	rounds: LeverageRound[] = []
	leverageRemaining: number
	orgs: OrganizationWithFunding[]
	sumRemainingOrgs: number
	initialSumRemainingOrgs: number

	/**
	 * Clone top orgs (so no reference issues)
	 * Add an accumulator for the leverage allocation per round
	 * Also calculate sumRemainingOrgs for first round leverage
	 */
	constructor(
		orgs: OrganizationWithFunding[],
		leverageRemaining: number) {

		this.leverageRemaining = leverageRemaining

		let sumRemainingOrgs = 0
		this.orgs = orgs.map(org => {
			const orgClone = { ...org }

			delete (orgClone).createdAt
			orgClone.save = org.save
			orgClone.pledgeTotal = org.pledgeTotal
			orgClone.amountFromVotes = org.amountFromVotes
			orgClone.allocatedFunds = org.allocatedFunds
			orgClone.need = org.need

			// Accumulator for funds recieved from leverage spread
			orgClone.leverageFunds = 0

			// Use the loop to calculate the funding total of all orgs (for percentage calculation)
			sumRemainingOrgs = roundFloat(String(sumRemainingOrgs + (orgClone.allocatedFunds || 0)))

			return orgClone
		})

		this.initialSumRemainingOrgs = sumRemainingOrgs
		this.sumRemainingOrgs = sumRemainingOrgs

		// Calculate percentage once for each org based on initial funding
		this.orgs.forEach(org => {
			org.percent = this.initialSumRemainingOrgs > 0 ? (org.allocatedFunds || 0) / this.initialSumRemainingOrgs : 0
		})

		// Normalize percentages to sum to 100% for orgs that still need funding
		// This accounts for orgs that are already fully funded and removed from the pool
		const remainingOrgs = this.orgs.filter(org => (org.need || 0) > 0)
		const sumRemainingPercents = remainingOrgs.reduce((sum, org) => sum + (org.percent || 0), 0)

		if(sumRemainingPercents > 0 && sumRemainingPercents < 1) {
			remainingOrgs.forEach(org => {
				org.percent = (org.percent || 0) / sumRemainingPercents
			})
		}
	}

	/**
	 * Returns array of "rounds" representing the distribution of the remaining leverage
	 * Performs a single round of proportional distribution using normalized percentages
	 */
	getLeverageSpreadRounds() {
		// Single round of proportional distribution using normalized percentages
		if(this.leverageRemaining >= 1 && this._numFullyFundedOrgs() < this.orgs.length) {
			const round: LeverageRound = {
				leverageRemaining: this.leverageRemaining,
				sumRemainingOrgs: this.sumRemainingOrgs,
				orgs: [],
			}

			const trackers: RoundTracker = {
				newSumRemainingOrgs: 0,
				givenThisRound: 0,
			}

			const roundOrgs = this.orgs.map(org => {
				const updatedOrg = this._orgRoundValues(org)

				trackers.givenThisRound = roundFloat(String(trackers.givenThisRound + (updatedOrg.roundFunds || 0)))

				if((updatedOrg.need || 0) > 0) {
					trackers.newSumRemainingOrgs = roundFloat(String(trackers.newSumRemainingOrgs + (updatedOrg.allocatedFunds || 0)))
				}

				return updatedOrg
			})

			this.sumRemainingOrgs = trackers.newSumRemainingOrgs
			this.leverageRemaining = roundFloat(String(this.leverageRemaining - trackers.givenThisRound))

			round.orgs = _.cloneDeep(roundOrgs)
			this.rounds.push(round)
		}

		return this.rounds
	}

	_orgRoundValues(org: OrganizationWithFunding) {
		/** DEFAULTS **/
		org.roundFunds = 0 // Amount allocated to org this round

		// Use the pre-calculated normalized percentage (computed once in constructor)
		// Give funds for this round using the fixed percentage
		org.roundFunds = roundFloat(String(Math.min(
			(org.percent || 0) * this.leverageRemaining,
			org.need || 0
		)))

		// Accumulate the running total of all accrued funds during leverage rounds
		org.leverageFunds = roundFloat(String((org.leverageFunds || 0) + (org.roundFunds || 0)))

		// Amount needed to be fully funded
		org.need = roundFloat(String((org.ask || 0) - (org.allocatedFunds || 0) - (org.leverageFunds || 0)))

		return org
	}

	_numFullyFundedOrgs() {
		return this.orgs.reduce((sum, org) => {
			return sum + ((org.need || 0) <= 0 ? 1 : 0)
		}, 0)
	}

	finalRoundAllocation() {
		if(this.rounds.length === 0) return undefined

		const lastRound = this.rounds[this.rounds.length - 1]
		const leverageRemaining = lastRound.leverageRemaining
		const funds = lastRound.orgs.reduce((sum, org) => {
			return sum + ((org.leverageFunds || 0) > 0 ? (org.roundFunds || 0) : 0)
		}, 0)

		return roundFloat(String(leverageRemaining - funds))
	}

}

export default Leverage
