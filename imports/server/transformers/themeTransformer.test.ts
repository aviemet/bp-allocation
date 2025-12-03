import { expect } from "chai"
import { Random } from "meteor/random"

import { type OrgWithComputed } from "./orgTransformer"
import ThemeTransformer from "./themeTransformer"
import { type ThemeData, type SettingsData } from "/imports/api/db"
import { type MemberTheme } from "/imports/types/schema"

describe("ThemeTransformer", function() {
	const baseSettings: SettingsData = {
		_id: Random.id(),
		useKioskFundsVoting: false,
	}

	const baseTheme: ThemeData = {
		_id: Random.id(),
		title: "Test Theme",
		presentationSettings: Random.id(),
		organizations: [],
		numTopOrgs: 3,
		matchRatio: 2,
		leverageTotal: 100000,
		consolationActive: false,
		createdAt: new Date(),
	}

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
