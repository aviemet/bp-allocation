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

interface ThemeLeverageSettings {
	minLeverageAmountActive: boolean
	minLeverageAmount: number
}

class Leverage {
	rounds: LeverageRound[] = []
	leverageRemaining: number
	orgs: OrganizationWithFunding[]
	sumRemainingOrgs: number
	themeLeverageSettings: ThemeLeverageSettings

	/**
	 * Clone top orgs (so no reference issues)
	 * Add an accumulator for the leverage allocation per round
	 * Also calculate sumRemainingOrgs for first round leverage
	 */
	constructor(
		orgs: OrganizationWithFunding[],
		leverageRemaining: number,
		themeLeverageSettings: ThemeLeverageSettings = {
			minLeverageAmountActive: false,
			minLeverageAmount: 0,
		}) {

		this.leverageRemaining = leverageRemaining
		this.themeLeverageSettings = themeLeverageSettings

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

			// Use the loop to calculate the funding total of orgs not fully funded
			sumRemainingOrgs = roundFloat(sumRemainingOrgs + (orgClone.allocatedFunds || 0))

			return orgClone
		})

		this.sumRemainingOrgs = sumRemainingOrgs
	}

	/**
	 * Returns array of "rounds" representing the distribution of the remaining leverage
	 */
	getLeverageSpreadRounds() {
		let nRounds = 1

		while(this.leverageRemaining > 1 && this._numFullyFundedOrgs() < this.orgs.length && nRounds < 10) {

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
				const updatedOrg = this._orgRoundValues(org, nRounds)

				// Decrease remaining leverage by amount awarded
				trackers.givenThisRound = roundFloat(trackers.givenThisRound + (updatedOrg.roundFunds || 0))

				// Only orgs not yet funded are counted in the percentage ratio for next round
				if((updatedOrg.need || 0) > 0) {
					trackers.newSumRemainingOrgs = roundFloat(trackers.newSumRemainingOrgs + (updatedOrg.allocatedFunds || 0))
				}

				return updatedOrg
			})

			this.sumRemainingOrgs = trackers.newSumRemainingOrgs
			this.leverageRemaining = roundFloat(this.leverageRemaining - trackers.givenThisRound)

			round.orgs = _.cloneDeep(roundOrgs)
			this.rounds.push(round)
			nRounds++
		}

		return this.rounds
	}

	_orgRoundValues(org: OrganizationWithFunding, nRounds: number) {
		/** DEFAULTS **/
		org.roundFunds = 0 // Amount allocated to org this round
		org.percent = 0 // Percentage of remaining pot used for allocation

		const shouldApplyMinimum = this.themeLeverageSettings.minLeverageAmountActive && nRounds === 1

		if(shouldApplyMinimum) {
			const minimumTarget = this.themeLeverageSettings.minLeverageAmount
			const currentAllocated = org.allocatedFunds || 0
			const need = org.need || 0
			const remainingLeverage = this.leverageRemaining
			const difference = Math.max(minimumTarget - currentAllocated, 0)
			org.roundFunds = roundFloat(Math.min(difference, need, remainingLeverage))
		} else {
			// Calculate all percentage on 1st, subsequently only calculate percentage if not fully funded
			if(nRounds === 1 || (org.need || 0) > 0 && this.sumRemainingOrgs !== 0) {
				// Percent: (funding amount from voting/pledges) / (sum of that amount for orgs not yet fully funded)
				org.percent = (org.allocatedFunds || 0) / this.sumRemainingOrgs
			}

			// Give funds for this round
			org.roundFunds = roundFloat(Math.min(
				(org.percent || 0) * this.leverageRemaining,
				org.need || 0
			))
		}

		// Accumulate the running total of all accrued funds during leverage rounds
		org.leverageFunds = roundFloat((org.leverageFunds || 0) + (org.roundFunds || 0))

		// Amount needed to be fully funded
		org.need = roundFloat((org.ask || 0) - (org.allocatedFunds || 0) - (org.leverageFunds || 0))

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

		return roundFloat(leverageRemaining - funds)
	}

}

export default Leverage
