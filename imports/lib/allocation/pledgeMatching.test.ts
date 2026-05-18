import { expect } from "chai"
import { Random } from "meteor/random"

import {
	calculatePledgeMatches,
	formatMatchRatioFromMultiplier,
	isOrgEligibleForLeverage,
	leverageBonusForPledge,
	matchMultiplierForPledge,
	pledgeTotalForOrg,
	votedFundsForPool,
	type PledgeMatchingTheme,
	type PledgeMatchingOrg,
	type PledgeMatchingContext,
} from "./pledgeMatching"
import { type MatchPledge, type MemberTheme } from "/imports/types/schema"

const makePledge = (
	overrides: Partial<MatchPledge> & { amount: number },
): MatchPledge => ({
	_id: Random.id(),
	createdAt: new Date(),
	pledgeType: "standard",
	...overrides,
})

const baseContext: PledgeMatchingContext = {
	consolationTotal: 0,
	startingFundsTotal: 0,
	votedFunds: 0,
}

describe("calculatePledgeMatches", function() {
	describe("Empty inputs", function() {
		it("Returns an empty map and full pool when there are no pledges", function() {
			const theme: PledgeMatchingTheme = { matchRatio: 2, leverageTotal: 5000 }
			const result = calculatePledgeMatches([], theme, baseContext)
			expect(result.matchedAmounts.size).to.equal(0)
			expect(result.remainingLeverage).to.equal(5000)
		})

		it("Returns 0 matched for an org with empty pledges array", function() {
			const orgs: PledgeMatchingOrg[] = [{ _id: Random.id(), pledges: [] }]
			const theme: PledgeMatchingTheme = { matchRatio: 2, leverageTotal: 1000 }
			const result = calculatePledgeMatches(orgs, theme, baseContext)
			expect(result.matchedAmounts.size).to.equal(0)
			expect(result.remainingLeverage).to.equal(1000)
		})
	})

	describe("Full match scenarios", function() {
		it("Fully matches a pledge that fits within the pool (matchRatio 2)", function() {
			const pledge = makePledge({ amount: 500 })
			const orgs: PledgeMatchingOrg[] = [{ _id: Random.id(), pledges: [pledge] }]
			const theme: PledgeMatchingTheme = { matchRatio: 2, leverageTotal: 5000 }

			const result = calculatePledgeMatches(orgs, theme, baseContext)

			expect(result.matchedAmounts.get(pledge._id)).to.equal(500)
			expect(result.remainingLeverage).to.equal(4500)
		})

		it("Fully matches an in-person pledge using inPersonMatchRatio (3)", function() {
			const pledge = makePledge({ amount: 100, pledgeType: "inPerson" })
			const orgs: PledgeMatchingOrg[] = [{ _id: Random.id(), pledges: [pledge] }]
			const theme: PledgeMatchingTheme = { matchRatio: 2, inPersonMatchRatio: 3, leverageTotal: 5000 }

			const result = calculatePledgeMatches(orgs, theme, baseContext)

			expect(result.matchedAmounts.get(pledge._id)).to.equal(100)
			expect(result.remainingLeverage).to.equal(4800)
		})

		it("Subtracts crowd-favorite full-funding and other context terms from the starting pool", function() {
			const pledge = makePledge({ amount: 100 })
			const orgs: PledgeMatchingOrg[] = [{
				_id: Random.id(),
				pledges: [pledge],
				topOff: 500,
			}]
			const theme: PledgeMatchingTheme = { matchRatio: 2, leverageTotal: 5000 }
			const context: PledgeMatchingContext = {
				consolationTotal: 1000,
				startingFundsTotal: 500,
				votedFunds: 200,
			}

			const result = calculatePledgeMatches(orgs, theme, context)

			expect(result.matchedAmounts.get(pledge._id)).to.equal(100)
			expect(result.remainingLeverage).to.equal(5000 - 1000 - 500 - 200 - 500 - 100)
		})
	})

	describe("Partial match scenarios", function() {
		it("Truncates matched amount when pool can't cover full pledge", function() {
			const pledge = makePledge({ amount: 1000, pledgeType: "inPerson" })
			const orgs: PledgeMatchingOrg[] = [{ _id: Random.id(), pledges: [pledge] }]
			const theme: PledgeMatchingTheme = {
				matchRatio: 2,
				inPersonMatchRatio: 3,
				leverageTotal: 500,
			}

			const result = calculatePledgeMatches(orgs, theme, baseContext)

			expect(result.matchedAmounts.get(pledge._id)).to.equal(250)
			expect(result.remainingLeverage).to.equal(0)
		})

		it("Marks all subsequent pledges as 0 matched once pool is exhausted", function() {
			const earlyPledge = makePledge({ amount: 1000, createdAt: new Date(2000, 0, 1) })
			const latePledge = makePledge({ amount: 500, createdAt: new Date(2025, 0, 1) })
			const orgs: PledgeMatchingOrg[] = [{
				_id: Random.id(),
				pledges: [earlyPledge, latePledge],
			}]
			const theme: PledgeMatchingTheme = { matchRatio: 2, leverageTotal: 1000 }

			const result = calculatePledgeMatches(orgs, theme, baseContext)

			expect(result.matchedAmounts.get(earlyPledge._id)).to.equal(1000)
			expect(result.matchedAmounts.get(latePledge._id)).to.equal(0)
			expect(result.remainingLeverage).to.equal(0)
		})

		it("Walks pledges in chronological order across orgs (cascade)", function() {
			const orgA = Random.id()
			const orgB = Random.id()
			const first = makePledge({ amount: 600, createdAt: new Date(2000, 0, 1) })
			const second = makePledge({ amount: 600, createdAt: new Date(2000, 0, 2) })

			const orgs: PledgeMatchingOrg[] = [
				{ _id: orgA, pledges: [second] },
				{ _id: orgB, pledges: [first] },
			]
			const theme: PledgeMatchingTheme = { matchRatio: 2, leverageTotal: 1000 }

			const result = calculatePledgeMatches(orgs, theme, baseContext)

			expect(result.matchedAmounts.get(first._id)).to.equal(600)
			expect(result.matchedAmounts.get(second._id)).to.equal(400)
			expect(result.remainingLeverage).to.equal(0)
		})
	})

	describe("Mixed standard + in-person ordering", function() {
		it("Applies the appropriate ratio per pledge in chronological order", function() {
			const standardPledge = makePledge({
				amount: 200,
				pledgeType: "standard",
				createdAt: new Date(2000, 0, 1),
			})
			const inPersonPledge = makePledge({
				amount: 100,
				pledgeType: "inPerson",
				createdAt: new Date(2000, 0, 2),
			})
			const orgs: PledgeMatchingOrg[] = [
				{ _id: Random.id(), pledges: [standardPledge, inPersonPledge] },
			]
			const theme: PledgeMatchingTheme = {
				matchRatio: 2,
				inPersonMatchRatio: 3,
				leverageTotal: 1000,
			}

			const result = calculatePledgeMatches(orgs, theme, baseContext)

			expect(result.matchedAmounts.get(standardPledge._id)).to.equal(200)
			expect(result.matchedAmounts.get(inPersonPledge._id)).to.equal(100)
			expect(result.remainingLeverage).to.equal(1000 - 200 - 200)
		})
	})

	describe("Edge cases", function() {
		it("Treats matchRatio <= 1 as no leverage cost (pledge fully matched, pool unchanged)", function() {
			const pledge = makePledge({ amount: 500 })
			const orgs: PledgeMatchingOrg[] = [{ _id: Random.id(), pledges: [pledge] }]
			const theme: PledgeMatchingTheme = { matchRatio: 1, leverageTotal: 100 }

			const result = calculatePledgeMatches(orgs, theme, baseContext)

			expect(result.matchedAmounts.get(pledge._id)).to.equal(500)
			expect(result.remainingLeverage).to.equal(100)
		})

		it("Marks runner-up pledges as 0 matched when not eligible for leverage", function() {
			const topOrgId = Random.id()
			const runnerUpId = Random.id()
			const topPledge = makePledge({ amount: 100 })
			const runnerUpPledge = makePledge({ amount: 200 })

			const orgs: PledgeMatchingOrg[] = [
				{ _id: topOrgId, pledges: [topPledge] },
				{ _id: runnerUpId, pledges: [runnerUpPledge] },
			]
			const theme: PledgeMatchingTheme = {
				matchRatio: 2,
				leverageTotal: 5000,
				leverageRunnersUpPledges: false,
			}
			const context: PledgeMatchingContext = {
				...baseContext,
				topOrgIds: new Set([topOrgId]),
			}

			const result = calculatePledgeMatches(orgs, theme, context)

			expect(result.matchedAmounts.get(topPledge._id)).to.equal(100)
			expect(result.matchedAmounts.get(runnerUpPledge._id)).to.equal(0)
			expect(result.remainingLeverage).to.equal(5000 - 100)
		})

		it("Uses _id tie-break when two pledges have the same createdAt", function() {
			const sameTime = new Date(2000, 0, 1)
			const a = makePledge({ _id: "aaa", amount: 600, createdAt: sameTime })
			const b = makePledge({ _id: "bbb", amount: 600, createdAt: sameTime })

			const orgs: PledgeMatchingOrg[] = [{ _id: Random.id(), pledges: [b, a] }]
			const theme: PledgeMatchingTheme = { matchRatio: 2, leverageTotal: 1000 }

			const result = calculatePledgeMatches(orgs, theme, baseContext)

			expect(result.matchedAmounts.get(a._id)).to.equal(600)
			expect(result.matchedAmounts.get(b._id)).to.equal(400)
		})
	})

	describe("Cascade safety - no persisted derived state", function() {
		it("Removing an early pledge causes a re-walk that promotes a later partial match to full", function() {
			const earlyId = Random.id()
			const lateId = Random.id()
			const orgId = Random.id()
			const theme: PledgeMatchingTheme = { matchRatio: 2, leverageTotal: 1000 }

			const orgsBefore: PledgeMatchingOrg[] = [{
				_id: orgId,
				pledges: [
					{ _id: earlyId, amount: 700, pledgeType: "standard", createdAt: new Date(2000, 0, 1) },
					{ _id: lateId, amount: 500, pledgeType: "standard", createdAt: new Date(2000, 0, 2) },
				],
			}]

			const before = calculatePledgeMatches(orgsBefore, theme, baseContext)
			expect(before.matchedAmounts.get(earlyId)).to.equal(700)
			expect(before.matchedAmounts.get(lateId)).to.equal(300)
			expect(before.remainingLeverage).to.equal(0)

			const orgsAfter: PledgeMatchingOrg[] = [{
				_id: orgId,
				pledges: [
					{ _id: lateId, amount: 500, pledgeType: "standard", createdAt: new Date(2000, 0, 2) },
				],
			}]

			const after = calculatePledgeMatches(orgsAfter, theme, baseContext)
			expect(after.matchedAmounts.has(earlyId), "Old pledge match must not be reported").to.be.false
			expect(after.matchedAmounts.get(lateId)).to.equal(500)
			expect(after.remainingLeverage).to.equal(500)
		})
	})
})

describe("leverageBonusForPledge", function() {
	it("Returns 0 when ratio <= 1", function() {
		const pledge = makePledge({ amount: 500 })
		const theme: PledgeMatchingTheme = { matchRatio: 1 }
		expect(leverageBonusForPledge(pledge, 500, theme)).to.equal(0)
	})

	it("Returns matchedAmount * (matchRatio - 1) for standard pledges", function() {
		const pledge = makePledge({ amount: 100 })
		const theme: PledgeMatchingTheme = { matchRatio: 2 }
		expect(leverageBonusForPledge(pledge, 100, theme)).to.equal(100)
	})

	it("Uses inPersonMatchRatio for in-person pledges", function() {
		const pledge = makePledge({ amount: 100, pledgeType: "inPerson" })
		const theme: PledgeMatchingTheme = { matchRatio: 2, inPersonMatchRatio: 3 }
		expect(leverageBonusForPledge(pledge, 100, theme)).to.equal(200)
	})

	it("Computes bonus on a smaller matched amount (partial match scenario)", function() {
		const pledge = makePledge({ amount: 100, pledgeType: "inPerson" })
		const theme: PledgeMatchingTheme = { matchRatio: 2, inPersonMatchRatio: 3 }
		expect(leverageBonusForPledge(pledge, 25, theme)).to.equal(50)
	})
})

describe("isOrgEligibleForLeverage", function() {
	it("Treats all orgs as finalists when topOrgIds is omitted", function() {
		const theme: PledgeMatchingTheme = {}
		expect(isOrgEligibleForLeverage("anything", theme)).to.equal(true)
	})

	it("Returns true for finalists regardless of leverageRunnersUpPledges", function() {
		const finalistId = Random.id()
		const topOrgIds = new Set([finalistId])
		expect(isOrgEligibleForLeverage(finalistId, {}, topOrgIds)).to.equal(true)
		expect(isOrgEligibleForLeverage(finalistId, { leverageRunnersUpPledges: false }, topOrgIds)).to.equal(true)
	})

	it("Returns false for runners-up when leverageRunnersUpPledges is falsy", function() {
		const runnerUpId = Random.id()
		const topOrgIds = new Set([Random.id()])
		expect(isOrgEligibleForLeverage(runnerUpId, {}, topOrgIds)).to.equal(false)
	})

	it("Returns true for runners-up when leverageRunnersUpPledges is true", function() {
		const runnerUpId = Random.id()
		const topOrgIds = new Set([Random.id()])
		expect(isOrgEligibleForLeverage(runnerUpId, { leverageRunnersUpPledges: true }, topOrgIds)).to.equal(true)
	})
})

describe("pledgeTotalForOrg", function() {
	it("Returns 0 for an org with no pledges", function() {
		const org: PledgeMatchingOrg = { _id: Random.id() }
		const theme: PledgeMatchingTheme = { matchRatio: 2 }
		expect(pledgeTotalForOrg(org, theme, undefined)).to.equal(0)
	})

	it("Falls back to fully-matched pledges when matchedAmounts is undefined (ratio 2 ⇒ amount * 2)", function() {
		const org: PledgeMatchingOrg = {
			_id: Random.id(),
			pledges: [makePledge({ amount: 500 }), makePledge({ amount: 300 })],
		}
		const theme: PledgeMatchingTheme = { matchRatio: 2 }
		expect(pledgeTotalForOrg(org, theme, undefined)).to.equal(1600)
	})

	it("Falls back to fully-matched pledges when matchedAmounts is undefined (ratio 3 ⇒ amount * 3)", function() {
		const org: PledgeMatchingOrg = {
			_id: Random.id(),
			pledges: [makePledge({ amount: 100 })],
		}
		const theme: PledgeMatchingTheme = { matchRatio: 3 }
		expect(pledgeTotalForOrg(org, theme, undefined)).to.equal(300)
	})

	it("Uses matchedAmounts to apply truncated bonuses on top of raw pledge amounts", function() {
		const fullId = Random.id()
		const partialId = Random.id()
		const org: PledgeMatchingOrg = {
			_id: Random.id(),
			pledges: [
				makePledge({ _id: fullId, amount: 500 }),
				makePledge({ _id: partialId, amount: 500 }),
			],
		}
		const theme: PledgeMatchingTheme = { matchRatio: 2 }
		const matchedAmounts = new Map<string, number>([[fullId, 500], [partialId, 200]])

		expect(pledgeTotalForOrg(org, theme, matchedAmounts)).to.equal(500 + 500 + 500 + 200)
	})

	it("Treats a missing matchedAmounts entry as 0 (no bonus, raw amount still counted)", function() {
		const org: PledgeMatchingOrg = {
			_id: Random.id(),
			pledges: [makePledge({ amount: 500 })],
		}
		const theme: PledgeMatchingTheme = { matchRatio: 2 }
		const matchedAmounts = new Map<string, number>()

		expect(pledgeTotalForOrg(org, theme, matchedAmounts)).to.equal(500)
	})

	it("Returns 0 for a runner-up org when leverageRunnersUpPledges is falsy", function() {
		const runnerUpId = Random.id()
		const org: PledgeMatchingOrg = {
			_id: runnerUpId,
			pledges: [makePledge({ amount: 500 })],
		}
		const theme: PledgeMatchingTheme = { matchRatio: 2 }
		const topOrgIds = new Set([Random.id()])

		expect(pledgeTotalForOrg(org, theme, undefined, topOrgIds)).to.equal(0)
	})

	it("Counts a runner-up's pledges when leverageRunnersUpPledges is true", function() {
		const runnerUpId = Random.id()
		const org: PledgeMatchingOrg = {
			_id: runnerUpId,
			pledges: [makePledge({ amount: 500 })],
		}
		const theme: PledgeMatchingTheme = { matchRatio: 2, leverageRunnersUpPledges: true }
		const topOrgIds = new Set([Random.id()])

		expect(pledgeTotalForOrg(org, theme, undefined, topOrgIds)).to.equal(1000)
	})

	it("Applies per-pledge ratios for mixed standard/inPerson pledges", function() {
		const standardId = Random.id()
		const inPersonId = Random.id()
		const org: PledgeMatchingOrg = {
			_id: Random.id(),
			pledges: [
				makePledge({ _id: standardId, amount: 100, pledgeType: "standard" }),
				makePledge({ _id: inPersonId, amount: 100, pledgeType: "inPerson" }),
			],
		}
		const theme: PledgeMatchingTheme = { matchRatio: 2, inPersonMatchRatio: 3 }
		const matchedAmounts = new Map<string, number>([[standardId, 100], [inPersonId, 100]])

		expect(pledgeTotalForOrg(org, theme, matchedAmounts)).to.equal(100 + 100 + 100 + 200)
	})
})

describe("votedFundsForPool", function() {
	it("sums all member allocations when kiosk funds voting is on", function() {
		const topId = Random.id()
		const memberThemes: MemberTheme[] = [
			{ _id: Random.id(), allocations: [{ organization: topId, amount: 120 }, { organization: Random.id(), amount: 30 }] },
			{ _id: Random.id(), allocations: [{ organization: topId, amount: 50 }] },
		]
		expect(votedFundsForPool(true, memberThemes, [], new Set())).to.equal(200)
	})

	it("sums amountFromVotes only for chit-finalist org ids when kiosk is off", function() {
		const topId = Random.id()
		const otherId = Random.id()
		const rawOrgs: PledgeMatchingOrg[] = [
			{ _id: topId, amountFromVotes: 1000 },
			{ _id: otherId, amountFromVotes: 9999 },
		]
		expect(votedFundsForPool(false, [], rawOrgs, new Set([topId]))).to.equal(1000)
	})
})

describe("matchMultiplierForPledge", function() {
	it("Uses matchRatio for standard pledges", function() {
		const pledge = makePledge({ amount: 1, pledgeType: "standard" })
		const theme: PledgeMatchingTheme = { matchRatio: 2, inPersonMatchRatio: 5 }
		expect(matchMultiplierForPledge(pledge, theme)).to.equal(2)
	})

	it("Uses inPersonMatchRatio for in-person pledges", function() {
		const pledge = makePledge({ amount: 1, pledgeType: "inPerson" })
		const theme: PledgeMatchingTheme = { matchRatio: 2, inPersonMatchRatio: 5 }
		expect(matchMultiplierForPledge(pledge, theme)).to.equal(5)
	})

	it("Treats missing ratios as 0", function() {
		const standard = makePledge({ amount: 1, pledgeType: "standard" })
		const inPerson = makePledge({ amount: 1, pledgeType: "inPerson" })
		expect(matchMultiplierForPledge(standard, {})).to.equal(0)
		expect(matchMultiplierForPledge(inPerson, {})).to.equal(0)
	})
})

describe("formatMatchRatioFromMultiplier", function() {
	it("Maps total multiplier to colon label (2 → 1:1, 3 → 2:1)", function() {
		expect(formatMatchRatioFromMultiplier(2)).to.equal("1:1")
		expect(formatMatchRatioFromMultiplier(3)).to.equal("2:1")
	})

	it("Uses Math.max(0, m - 1) for edge multipliers", function() {
		expect(formatMatchRatioFromMultiplier(1)).to.equal("0:1")
		expect(formatMatchRatioFromMultiplier(0)).to.equal("0:1")
	})
})
