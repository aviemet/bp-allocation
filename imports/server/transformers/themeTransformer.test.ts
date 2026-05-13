import { expect } from "chai"
import { Random } from "meteor/random"

import { type OrgWithComputed } from "./orgTransformer"
import { ThemeTransformer } from "./themeTransformer"
import { type ThemeData, type SettingsData } from "/imports/api/db"

describe("ThemeTransformer", function() {
	const baseSettings = {
		_id: Random.id(),
		useKioskFundsVoting: false,
	} satisfies SettingsData

	const baseTheme = {
		_id: Random.id(),
		title: "Test Theme",
		presentationSettings: Random.id(),
		organizations: [],
		numTopOrgs: 3,
		matchRatio: 2,
		leverageTotal: 100000,
		consolationActive: false,
		createdAt: new Date(),
	} satisfies ThemeData

	const createOrg = (id: string, isTopOrg: boolean, pledgeAmount: number = 0): OrgWithComputed => ({
		_id: id,
		theme: baseTheme._id,
		title: `Org ${id}`,
		ask: 100000,
		amountFromVotes: 0,
		topOff: 0,
		pledges: pledgeAmount > 0
			? [
				{ _id: Random.id(), amount: pledgeAmount, createdAt: new Date() },
			]
			: [],
		leverageFunds: 0,
		createdAt: new Date(),
		save: 0,
		pledgeTotal: isTopOrg ? pledgeAmount * 2 : 0,
		votedTotal: 0,
		allocatedFunds: isTopOrg ? pledgeAmount * 2 : pledgeAmount,
		need: 100000 - (isTopOrg ? pledgeAmount * 2 : pledgeAmount),
		votes: isTopOrg ? 50 : 10,
	})

	describe("Leverage remaining calculation with runner-up pledges", function() {
		it("Should NOT subtract matched amount from leverage for runner-up pledges when leverageRunnersUpPledges is false", function() {
			const topOrgId = Random.id()
			const runnerUpOrgId = Random.id()

			const topOrgs: OrgWithComputed[] = [
				createOrg(topOrgId, true, 1000),
			]

			const allOrgs: OrgWithComputed[] = [
				...topOrgs,
				createOrg(runnerUpOrgId, false, 500),
			]

			const theme: ThemeData = {
				...baseTheme,
				allowRunnersUpPledges: true,
				leverageRunnersUpPledges: false,
			}

			const result = ThemeTransformer(theme, {
				topOrgs,
				allOrgs,
				memberThemes: [],
				settings: baseSettings,
			})

			const expectedLeverageRemaining = baseTheme.leverageTotal - (1000 * 2 - 1000)
			expect(result.leverageRemaining).to.equal(expectedLeverageRemaining)
		})

		it("Should subtract matched amount from leverage for runner-up pledges when leverageRunnersUpPledges is true", function() {
			const topOrgId = Random.id()
			const runnerUpOrgId = Random.id()

			const topOrgs: OrgWithComputed[] = [
				createOrg(topOrgId, true, 1000),
			]

			const allOrgs: OrgWithComputed[] = [
				...topOrgs,
				createOrg(runnerUpOrgId, false, 500),
			]

			const theme: ThemeData = {
				...baseTheme,
				allowRunnersUpPledges: true,
				leverageRunnersUpPledges: true,
			}

			const result = ThemeTransformer(theme, {
				topOrgs,
				allOrgs,
				memberThemes: [],
				settings: baseSettings,
			})

			const expectedLeverageRemaining = baseTheme.leverageTotal - (1000 * 2 - 1000) - (500 * 2 - 500)
			expect(result.leverageRemaining).to.equal(expectedLeverageRemaining)
		})

		it("Should always subtract matched amount from leverage for finalist pledges", function() {
			const topOrgId = Random.id()
			const runnerUpOrgId = Random.id()

			const topOrgs: OrgWithComputed[] = [
				createOrg(topOrgId, true, 1000),
			]

			const allOrgs: OrgWithComputed[] = [
				...topOrgs,
				createOrg(runnerUpOrgId, false, 500),
			]

			const theme: ThemeData = {
				...baseTheme,
				allowRunnersUpPledges: true,
				leverageRunnersUpPledges: false,
			}

			const result = ThemeTransformer(theme, {
				topOrgs,
				allOrgs,
				memberThemes: [],
				settings: baseSettings,
			})

			const topOrgMatchedAmount = 1000 * 2 - 1000
			expect(result.leverageRemaining).to.equal(baseTheme.leverageTotal - topOrgMatchedAmount)
		})
	})

	describe("Minimum starting funds", function() {
		it("Should subtract minStartingFunds * numTopOrgs from leverageRemaining when active", function() {
			const topOrgs: OrgWithComputed[] = [
				createOrg(Random.id(), true),
				createOrg(Random.id(), true),
			]

			const theme: ThemeData = {
				...baseTheme,
				numTopOrgs: 5,
				minStartingFunds: 2000,
				minStartingFundsActive: true,
			}

			const result = ThemeTransformer(theme, {
				topOrgs,
				allOrgs: topOrgs,
				memberThemes: [],
				settings: baseSettings,
			})

			expect(result.leverageRemaining).to.equal(baseTheme.leverageTotal - (2000 * 5))
		})

		it("Should NOT subtract minStartingFunds from leverageRemaining when toggle is off", function() {
			const topOrgs: OrgWithComputed[] = [
				createOrg(Random.id(), true),
			]

			const theme: ThemeData = {
				...baseTheme,
				numTopOrgs: 5,
				minStartingFunds: 2000,
				minStartingFundsActive: false,
			}

			const result = ThemeTransformer(theme, {
				topOrgs,
				allOrgs: topOrgs,
				memberThemes: [],
				settings: baseSettings,
			})

			expect(result.leverageRemaining).to.equal(baseTheme.leverageTotal)
		})
	})

	describe("Pledged total calculation", function() {
		it("Should include runner-up pledges in pledgedTotal when allowRunnersUpPledges is true", function() {
			const topOrgId = Random.id()
			const runnerUpOrgId = Random.id()

			const topOrgs: OrgWithComputed[] = [
				createOrg(topOrgId, true, 1000),
			]

			const allOrgs: OrgWithComputed[] = [
				...topOrgs,
				createOrg(runnerUpOrgId, false, 500),
			]

			const theme: ThemeData = {
				...baseTheme,
				allowRunnersUpPledges: true,
			}

			const result = ThemeTransformer(theme, {
				topOrgs,
				allOrgs,
				memberThemes: [],
				settings: baseSettings,
			})

			expect(result.pledgedTotal).to.equal(1500)
		})

		it("Should NOT include runner-up pledges in pledgedTotal when allowRunnersUpPledges is false", function() {
			const topOrgId = Random.id()
			const runnerUpOrgId = Random.id()

			const topOrgs: OrgWithComputed[] = [
				createOrg(topOrgId, true, 1000),
			]

			const allOrgs: OrgWithComputed[] = [
				...topOrgs,
				createOrg(runnerUpOrgId, false, 500),
			]

			const theme: ThemeData = {
				...baseTheme,
				allowRunnersUpPledges: false,
			}

			const result = ThemeTransformer(theme, {
				topOrgs,
				allOrgs,
				memberThemes: [],
				settings: baseSettings,
			})

			expect(result.pledgedTotal).to.equal(1000)
		})
	})

	describe("Pledge match total calculation", function() {
		it("Should sum the leverage bonus consumed by each pledge, not the raw pledged amount", function() {
			const topOrgId = Random.id()
			const topOrgs: OrgWithComputed[] = [
				createOrg(topOrgId, true, 1000),
			]
			const theme: ThemeData = {
				...baseTheme,
				matchRatio: 3,
			}

			const result = ThemeTransformer(theme, {
				topOrgs,
				memberThemes: [],
				settings: baseSettings,
			})

			expect(result.pledgedTotal).to.equal(1000)
			expect(result.pledgeMatchTotal).to.equal(2000)
		})

		it("Should apply the in-person ratio to in-person pledges and standard ratio to standard pledges", function() {
			const topOrgId = Random.id()
			const standardOrg = createOrg(topOrgId, true, 0)

			const standardPledge = 1000
			const inPersonPledge = 500

			standardOrg.pledges = [
				{ _id: Random.id(), amount: standardPledge, createdAt: new Date(), pledgeType: "standard" },
				{ _id: Random.id(), amount: inPersonPledge, createdAt: new Date(Date.now() + 1), pledgeType: "inPerson" },
			]
			const theme = {
				...baseTheme,
				matchRatio: 2,
				inPersonMatchRatio: 3,
			} satisfies ThemeData

			const result = ThemeTransformer(theme, {
				topOrgs: [standardOrg],
				memberThemes: [],
				settings: baseSettings,
			})

			expect(result.pledgedTotal).to.equal(standardPledge + inPersonPledge)
			expect(result.pledgeMatchTotal).to.equal((standardPledge * (theme.matchRatio - 1)) + (inPersonPledge * (theme.inPersonMatchRatio - 1)))
		})

		it("Should be zero when no pledges have been made", function() {
			const topOrgId = Random.id()
			const topOrgs: OrgWithComputed[] = [createOrg(topOrgId, true, 0)]

			const result = ThemeTransformer(baseTheme, {
				topOrgs,
				memberThemes: [],
				settings: baseSettings,
			})

			expect(result.pledgeMatchTotal).to.equal(0)
		})

		it("Should truncate the leverage bonus on the last pledge when the pool would be exceeded", function() {
			const topOrgId = Random.id()
			const org = createOrg(topOrgId, true, 0)
			org.pledges = [
				{ _id: Random.id(), amount: 40000, createdAt: new Date(1000), pledgeType: "standard" },
				{ _id: Random.id(), amount: 80000, createdAt: new Date(2000), pledgeType: "standard" },
			]
			const theme: ThemeData = {
				...baseTheme,
				matchRatio: 2,
				leverageTotal: 100000,
			}

			const result = ThemeTransformer(theme, {
				topOrgs: [org],
				memberThemes: [],
				settings: baseSettings,
			})

			// First pledge consumes 40k of leverage; only 60k remains for the second pledge's
			// 80k requested bonus, so the second pledge is partially matched.
			expect(result.pledgeMatchTotal).to.equal(100000)
			expect(result.leverageRemaining).to.equal(0)
		})
	})

	describe("Pledges list", function() {
		it("Should include runner-up pledges in pledges list when allowRunnersUpPledges is true", function() {
			const topOrgId = Random.id()
			const runnerUpOrgId = Random.id()

			const topOrgs: OrgWithComputed[] = [
				createOrg(topOrgId, true, 1000),
			]

			const allOrgs: OrgWithComputed[] = [
				...topOrgs,
				createOrg(runnerUpOrgId, false, 500),
			]

			const theme: ThemeData = {
				...baseTheme,
				allowRunnersUpPledges: true,
			}

			const result = ThemeTransformer(theme, {
				topOrgs,
				allOrgs,
				memberThemes: [],
				settings: baseSettings,
			})

			expect(result.pledges.length).to.equal(2)
			expect(result.pledges.some(p => p.org._id === topOrgId)).to.be.true
			expect(result.pledges.some(p => p.org._id === runnerUpOrgId)).to.be.true
		})

		it("Should NOT include runner-up pledges in pledges list when allowRunnersUpPledges is false", function() {
			const topOrgId = Random.id()
			const runnerUpOrgId = Random.id()

			const topOrgs: OrgWithComputed[] = [
				createOrg(topOrgId, true, 1000),
			]

			const allOrgs: OrgWithComputed[] = [
				...topOrgs,
				createOrg(runnerUpOrgId, false, 500),
			]

			const theme: ThemeData = {
				...baseTheme,
				allowRunnersUpPledges: false,
			}

			const result = ThemeTransformer(theme, {
				topOrgs,
				allOrgs,
				memberThemes: [],
				settings: baseSettings,
			})

			expect(result.pledges.length).to.equal(1)
			expect(result.pledges[0].org._id).to.equal(topOrgId)
		})
	})

	describe("Partial matching when leverage pool is exhausted", function() {
		it("Caps leverageRemaining at 0 when in-person pledges exceed pool capacity", function() {
			const topOrgId = Random.id()
			const inPersonPledgeId = Random.id()

			const topOrgs: OrgWithComputed[] = [{
				...createOrg(topOrgId, true, 0),
				pledges: [
					{
						_id: inPersonPledgeId,
						amount: 1000,
						pledgeType: "inPerson",
						createdAt: new Date(),
					},
				],
			}]

			const theme: ThemeData = {
				...baseTheme,
				leverageTotal: 500,
				inPersonMatchRatio: 3,
			}

			const result = ThemeTransformer(theme, {
				topOrgs,
				allOrgs: topOrgs,
				memberThemes: [],
				settings: baseSettings,
			})

			expect(result.leverageRemaining).to.equal(0)
		})
	})

	describe("Complex scenarios", function() {
		it("Should handle multiple finalists and runners up with mixed leverage settings", function() {
			const topOrg1Id = Random.id()
			const topOrg2Id = Random.id()
			const runnerUp1Id = Random.id()
			const runnerUp2Id = Random.id()

			const topOrgs: OrgWithComputed[] = [
				createOrg(topOrg1Id, true, 1000),
				createOrg(topOrg2Id, true, 2000),
			]

			const allOrgs: OrgWithComputed[] = [
				...topOrgs,
				createOrg(runnerUp1Id, false, 500),
				createOrg(runnerUp2Id, false, 750),
			]

			const theme: ThemeData = {
				...baseTheme,
				allowRunnersUpPledges: true,
				leverageRunnersUpPledges: true,
			}

			const result = ThemeTransformer(theme, {
				topOrgs,
				allOrgs,
				memberThemes: [],
				settings: baseSettings,
			})

			expect(result.pledgedTotal).to.equal(4250)
			expect(result.pledges.length).to.equal(4)

			const expectedLeverageRemaining = baseTheme.leverageTotal
				- (1000 * 2 - 1000)
				- (2000 * 2 - 2000)
				- (500 * 2 - 500)
				- (750 * 2 - 750)
			expect(result.leverageRemaining).to.equal(expectedLeverageRemaining)
		})
	})
})
