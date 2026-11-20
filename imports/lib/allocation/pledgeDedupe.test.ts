import { expect } from "chai"

import {
	hasRecentMatchingPledge,
	pledgeDedupeKey,
	PLEDGE_DEDUPE_WINDOW_MS,
	releasePledgeAttempt,
	resetPledgeDedupeStateForTests,
	tryClaimPledgeAttempt,
} from "./pledgeDedupe"

describe("pledgeDedupe", function() {
	beforeEach(function() {
		resetPledgeDedupeStateForTests()
	})

	describe("pledgeDedupeKey", function() {
		it("Includes member, org, amount, and pledge type", function() {
			expect(pledgeDedupeKey("member1", "org1", 100, "standard")).to.equal("member1:org1:100:standard")
		})
	})

	describe("hasRecentMatchingPledge", function() {
		const now = Date.UTC(2026, 0, 1, 12, 0, 0)

		it("Returns false when there are no pledges", function() {
			expect(hasRecentMatchingPledge(undefined, "member1", 100, "standard", now)).to.equal(false)
		})

		it("Returns true for a matching pledge inside the window", function() {
			const pledges = [{
				_id: "p1",
				amount: 100,
				member: "member1",
				pledgeType: "standard" as const,
				createdAt: new Date(now - 1_000),
			}]
			expect(hasRecentMatchingPledge(pledges, "member1", 100, "standard", now)).to.equal(true)
		})

		it("Returns false when the matching pledge is outside the window", function() {
			const pledges = [{
				_id: "p1",
				amount: 100,
				member: "member1",
				pledgeType: "standard" as const,
				createdAt: new Date(now - PLEDGE_DEDUPE_WINDOW_MS - 1),
			}]
			expect(hasRecentMatchingPledge(pledges, "member1", 100, "standard", now)).to.equal(false)
		})

		it("Returns false when amount or member differs", function() {
			const pledges = [{
				_id: "p1",
				amount: 100,
				member: "member1",
				pledgeType: "standard" as const,
				createdAt: new Date(now - 1_000),
			}]
			expect(hasRecentMatchingPledge(pledges, "member1", 200, "standard", now)).to.equal(false)
			expect(hasRecentMatchingPledge(pledges, "member2", 100, "standard", now)).to.equal(false)
		})
	})

	describe("tryClaimPledgeAttempt", function() {
		it("Allows the first claim and rejects a second within the window", function() {
			const key = pledgeDedupeKey("member1", "org1", 50, "standard")
			expect(tryClaimPledgeAttempt(key, 1_000)).to.equal(true)
			expect(tryClaimPledgeAttempt(key, 1_000 + 100)).to.equal(false)
		})

		it("Allows another claim after the window", function() {
			const key = pledgeDedupeKey("member1", "org1", 50, "standard")
			expect(tryClaimPledgeAttempt(key, 1_000)).to.equal(true)
			expect(tryClaimPledgeAttempt(key, 1_000 + PLEDGE_DEDUPE_WINDOW_MS)).to.equal(true)
		})

		it("releasePledgeAttempt frees the key for an immediate retry", function() {
			const key = pledgeDedupeKey("member1", "org1", 50, "standard")
			const claimedAt = 1_000
			expect(tryClaimPledgeAttempt(key, claimedAt)).to.equal(true)
			releasePledgeAttempt(key, claimedAt)
			expect(tryClaimPledgeAttempt(key, claimedAt + 1)).to.equal(true)
		})
	})
})
