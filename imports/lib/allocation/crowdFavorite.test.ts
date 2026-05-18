import { expect } from "chai"
import { Random } from "meteor/random"

import { crowdFavoriteTopOff } from "./crowdFavorite"

describe("crowdFavoriteTopOff", function() {
	it("matches post-vote pre-pledge gap when pool is large", function() {
		const orgId = Random.id()
		const themeId = Random.id()
		const org = {
			_id: orgId,
			theme: themeId,
			ask: 10000,
			amountFromVotes: 3000,
			pledges: [],
			topOff: 0,
		}
		const theme = {
			_id: themeId,
			matchRatio: 2,
			leverageTotal: 50000,
			organizations: [orgId],
			numTopOrgs: 10,
		}
		expect(crowdFavoriteTopOff({
			org,
			rawOrgs: [org],
			theme,
			useKioskFundsVoting: false,
			memberThemes: [],
		})).to.equal(7000)
	})

	it("subtracts save and starting funds from the gap", function() {
		const orgId = Random.id()
		const themeId = Random.id()
		const org = {
			_id: orgId,
			theme: themeId,
			ask: 10000,
			amountFromVotes: 1000,
			pledges: [],
			topOff: 0,
		}
		const theme = {
			_id: themeId,
			matchRatio: 2,
			leverageTotal: 50000,
			organizations: [orgId],
			numTopOrgs: 10,
			saves: [{ org: orgId, amount: 2500 }],
			minStartingFundsActive: true,
			minStartingFunds: 1500,
		}
		expect(crowdFavoriteTopOff({
			org,
			rawOrgs: [org],
			theme,
			useKioskFundsVoting: false,
			memberThemes: [],
		})).to.equal(5000)
	})
})
