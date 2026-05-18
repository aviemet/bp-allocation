import { expect } from "chai"

import { memberFundsVoteStatus, memberVoteSummary } from "./memberVotes"

describe("memberFundsVoteStatus", function() {
	it("returns none when there are no allocations", function() {
		expect(memberFundsVoteStatus(100, [])).to.equal("none")
	})

	it("returns full when allocated total equals member funds", function() {
		expect(memberFundsVoteStatus(100, [
			{ amount: 60 },
			{ amount: 40 },
		])).to.equal("full")
	})

	it("returns partial when allocated total is below member funds", function() {
		expect(memberFundsVoteStatus(100, [
			{ amount: 75 },
		])).to.equal("partial")
	})

	it("returns partial when allocations exist but sum to zero", function() {
		expect(memberFundsVoteStatus(100, [
			{ amount: 0 },
		])).to.equal("partial")
	})
})

describe("memberVoteSummary", function() {
	it("flattens vote fields from a member theme", function() {
		expect(memberVoteSummary({
			amount: 100,
			allocations: [{ organization: "org1", amount: 40 }],
			chitVotes: [{ organization: "org1", votes: 2 }],
		})).to.deep.equal({
			votedTotal: 40,
			votedChits: true,
			fundsVoteStatus: "partial",
		})
	})
})
