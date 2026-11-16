import { expect } from "chai"

import {
	fundedTotal,
	overviewAllocatedTotal,
	overviewConsolationAmount,
	sumOverviewAllocatedTotal,
	sumOverviewChitVotes,
	sumOverviewConsolationTotal,
	sumOverviewVotedTotal,
} from "./displayTotals"

describe("displayTotals overview allocation", function() {
	it("overviewConsolationAmount is zero for top orgs when consolation is active", function() {
		expect(overviewConsolationAmount(true, { consolationActive: true, consolationAmount: 10_000 })).to.equal(0)
	})

	it("overviewConsolationAmount applies to non-top orgs when consolation is active", function() {
		expect(overviewConsolationAmount(false, { consolationActive: true, consolationAmount: 10_000 })).to.equal(10_000)
	})

	it("overviewAllocatedTotal matches funded total plus consolation", function() {
		const theme = { consolationActive: true, consolationAmount: 5_000 }
		expect(overviewAllocatedTotal(
			{ allocatedFunds: 20_000, leverageFunds: 3_000 },
			theme,
			false,
		)).to.equal(fundedTotal(20_000, 3_000) + 5_000)
	})

	it("sumOverviewAllocatedTotal sums per-org overview totals", function() {
		const theme = { consolationActive: true, consolationAmount: 1_000 }
		const topOrgIds = new Set(["top"])
		const orgs = [
			{ _id: "top", allocatedFunds: 10_000, leverageFunds: 2_000 },
			{ _id: "other", allocatedFunds: 5_000, leverageFunds: 500 },
		]
		const expected = overviewAllocatedTotal(orgs[0], theme, true)
			+ overviewAllocatedTotal(orgs[1], theme, false)
		expect(sumOverviewAllocatedTotal(orgs, theme, topOrgIds)).to.equal(expected)
	})

	it("sumOverviewChitVotes rounds the org vote total", function() {
		expect(sumOverviewChitVotes([
			{ votes: 1.25 },
			{ votes: 2.333 },
		])).to.equal(3.6)
	})

	it("sumOverviewVotedTotal sums votedTotal per org", function() {
		expect(sumOverviewVotedTotal([
			{ votedTotal: 100 },
			{ votedTotal: 250 },
		])).to.equal(350)
	})

	it("sumOverviewConsolationTotal sums per-org consolation column values", function() {
		const theme = { consolationActive: true, consolationAmount: 2_000 }
		const topOrgIds = new Set(["a"])
		expect(sumOverviewConsolationTotal(
			[{ _id: "a", allocatedFunds: 0, leverageFunds: 0 }, { _id: "b", allocatedFunds: 0, leverageFunds: 0 }],
			theme,
			topOrgIds,
		)).to.equal(2_000)
	})
})
