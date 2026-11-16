import { expect } from "chai"

import { rawPledgeTotal, sumRawPledgeTotal, sumTopOff } from "./orgPledges"

describe("orgPledges totals", function() {
	it("sumRawPledgeTotal sums rawPledgeTotal per org", function() {
		const orgs = [
			{ pledges: [{ amount: 100 }, { amount: 50 }] },
			{ pledges: [{ amount: 200 }] },
			{},
		]
		expect(sumRawPledgeTotal(orgs)).to.equal(350)
	})

	it("sumTopOff sums topOff per org", function() {
		expect(sumTopOff([
			{ topOff: 1_000 },
			{ topOff: 500 },
			{},
		])).to.equal(1_500)
	})

	it("sumRawPledgeTotal matches rawPledgeTotal for a single org", function() {
		const org = { pledges: [{ amount: 75 }] }
		expect(sumRawPledgeTotal([org])).to.equal(rawPledgeTotal(org))
	})
})
