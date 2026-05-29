import { expect } from "chai"

import {
	normalizeOrgAsk,
	remainingGapToAskDuringPledgeWalk,
} from "./orgFunding"

describe("normalizeOrgAsk", function() {
	it("defaults missing ask to 0 like OrgTransformer", function() {
		expect(normalizeOrgAsk(undefined)).to.equal(0)
		expect(normalizeOrgAsk(500)).to.equal(500)
	})
})

describe("remainingGapToAskDuringPledgeWalk", function() {
	it("returns dollars left to ask after pre-pledge allocation and prior pledges in the walk", function() {
		expect(remainingGapToAskDuringPledgeWalk(1000, 300, 200)).to.equal(500)
	})

	it("returns 0 when already at or past ask", function() {
		expect(remainingGapToAskDuringPledgeWalk(500, 400, 200)).to.equal(0)
		expect(remainingGapToAskDuringPledgeWalk(undefined, 0, 0)).to.equal(0)
	})
})
