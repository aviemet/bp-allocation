import { expect } from "chai"
import { Random } from "meteor/random"

import OrgTransformer, { calculateVotesFromRawOrg } from "./orgTransformer"
import { type OrgData, type ThemeData, type SettingsData } from "/imports/api/db"

describe("OrgTransformer", function() {
	const baseTheme: ThemeData = {
		_id: Random.id(),
		title: "Test Theme",
		presentationSettings: Random.id(),
		organizations: [],
		numTopOrgs: 3,
		matchRatio: 2,
		createdAt: new Date(),
	}

	const baseSettings: SettingsData = {
		_id: Random.id(),
		useKioskFundsVoting: false,
	}

	const baseOrg: OrgData = {
		_id: Random.id(),
		theme: baseTheme._id,
		title: "Test Org",
		ask: 100000,
		amountFromVotes: 0,
		topOff: 0,
		pledges: [],
		leverageFunds: 0,
		createdAt: new Date(),
	}

	describe("Pledge matching for finalists", function() {
		it("Should apply matchRatio to finalist org pledges", function() {
			const topOrgId = Random.id()
			const org: OrgData = {
				...baseOrg,
				_id: topOrgId,
				pledges: [
					{ _id: Random.id(), amount: 1000, createdAt: new Date() },
					{ _id: Random.id(), amount: 500, createdAt: new Date() },
				],
			}

			const topOrgIds = new Set([topOrgId])
			const result = OrgTransformer(org, {
				theme: baseTheme,
				settings: baseSettings,
				memberThemes: [],
				topOrgIds,
			})

			expect(result.pledgeTotal).to.equal(3000)
		})

		it("Should apply matchRatio even when leverageRunnersUpPledges is false for finalists", function() {
			const topOrgId = Random.id()
			const org: OrgData = {
				...baseOrg,
				_id: topOrgId,
				pledges: [
					{ _id: Random.id(), amount: 1000, createdAt: new Date() },
				],
			}

			const theme: ThemeData = {
				...baseTheme,
				leverageRunnersUpPledges: false,
			}

			const topOrgIds = new Set([topOrgId])
			const result = OrgTransformer(org, {
				theme,
				settings: baseSettings,
				memberThemes: [],
				topOrgIds,
			})

			expect(result.pledgeTotal).to.equal(2000)
		})
	})

	describe("Pledge matching for runners up", function() {
		it("Should NOT apply matchRatio to runner-up org pledges when leverageRunnersUpPledges is false", function() {
			const runnerUpOrgId = Random.id()
			const topOrgId = Random.id()
			const org: OrgData = {
				...baseOrg,
				_id: runnerUpOrgId,
				pledges: [
					{ _id: Random.id(), amount: 1000, createdAt: new Date() },
					{ _id: Random.id(), amount: 500, createdAt: new Date() },
				],
			}

			const theme: ThemeData = {
				...baseTheme,
				leverageRunnersUpPledges: false,
			}

			const topOrgIds = new Set([topOrgId])
			const result = OrgTransformer(org, {
				theme,
				settings: baseSettings,
				memberThemes: [],
				topOrgIds,
			})

			expect(result.pledgeTotal).to.equal(0)
		})

		it("Should apply matchRatio to runner-up org pledges when leverageRunnersUpPledges is true", function() {
			const runnerUpOrgId = Random.id()
			const topOrgId = Random.id()
			const org: OrgData = {
				...baseOrg,
				_id: runnerUpOrgId,
				pledges: [
					{ _id: Random.id(), amount: 1000, createdAt: new Date() },
					{ _id: Random.id(), amount: 500, createdAt: new Date() },
				],
			}

			const theme: ThemeData = {
				...baseTheme,
				leverageRunnersUpPledges: true,
			}

			const topOrgIds = new Set([topOrgId])
			const result = OrgTransformer(org, {
				theme,
				settings: baseSettings,
				memberThemes: [],
				topOrgIds,
			})

			expect(result.pledgeTotal).to.equal(3000)
		})

		it("Should default to no matching for runner-ups when leverageRunnersUpPledges is undefined", function() {
			const runnerUpOrgId = Random.id()
			const topOrgId = Random.id()
			const org: OrgData = {
				...baseOrg,
				_id: runnerUpOrgId,
				pledges: [
					{ _id: Random.id(), amount: 1000, createdAt: new Date() },
				],
			}

			const theme: ThemeData = {
				...baseTheme,
			}
			delete (theme as { leverageRunnersUpPledges?: boolean }).leverageRunnersUpPledges

			const topOrgIds = new Set([topOrgId])
			const result = OrgTransformer(org, {
				theme,
				settings: baseSettings,
				memberThemes: [],
				topOrgIds,
			})

			expect(result.pledgeTotal).to.equal(0)
		})
	})

	describe("Pledge matching when topOrgIds is not provided", function() {
		it("Should default to applying matchRatio when topOrgIds is undefined", function() {
			const org: OrgData = {
				...baseOrg,
				pledges: [
					{ _id: Random.id(), amount: 1000, createdAt: new Date() },
				],
			}

			const result = OrgTransformer(org, {
				theme: baseTheme,
				settings: baseSettings,
				memberThemes: [],
			})

			expect(result.pledgeTotal).to.equal(2000)
		})
	})

	describe("Allocated funds calculation", function() {
		it("Should correctly calculate allocatedFunds for runner-up without leverage matching", function() {
			const runnerUpOrgId = Random.id()
			const topOrgId = Random.id()
			const org: OrgData = {
				...baseOrg,
				_id: runnerUpOrgId,
				amountFromVotes: 5000,
				pledges: [
					{ _id: Random.id(), amount: 1000, createdAt: new Date() },
				],
			}

			const theme: ThemeData = {
				...baseTheme,
				leverageRunnersUpPledges: false,
			}

			const topOrgIds = new Set([topOrgId])
			const result = OrgTransformer(org, {
				theme,
				settings: baseSettings,
				memberThemes: [],
				topOrgIds,
			})

			expect(result.allocatedFunds).to.equal(5000)
			expect(result.pledgeTotal).to.equal(0)
		})

		it("Should correctly calculate allocatedFunds for runner-up with leverage matching", function() {
			const runnerUpOrgId = Random.id()
			const topOrgId = Random.id()
			const org: OrgData = {
				...baseOrg,
				_id: runnerUpOrgId,
				amountFromVotes: 5000,
				pledges: [
					{ _id: Random.id(), amount: 1000, createdAt: new Date() },
				],
			}

			const theme: ThemeData = {
				...baseTheme,
				leverageRunnersUpPledges: true,
			}

			const topOrgIds = new Set([topOrgId])
			const result = OrgTransformer(org, {
				theme,
				settings: baseSettings,
				memberThemes: [],
				topOrgIds,
			})

			expect(result.allocatedFunds).to.equal(7000)
			expect(result.pledgeTotal).to.equal(2000)
		})
	})
})

describe("calculateVotesFromRawOrg", function() {
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
		chitWeight: 3,
		createdAt: new Date(),
	}

	it("Should calculate votes from chitVotes.count", function() {
		const org: OrgData = {
			_id: Random.id(),
			theme: baseTheme._id,
			title: "Test Org",
			ask: 100000,
			chitVotes: {
				count: 42,
				weight: 0,
			},
			amountFromVotes: 0,
			topOff: 0,
			pledges: [],
			leverageFunds: 0,
			createdAt: new Date(),
		}

		const votes = calculateVotesFromRawOrg(org, baseSettings, baseTheme)
		expect(votes).to.equal(42)
	})

	it("Should calculate votes from chitVotes.weight when count is not available", function() {
		const org: OrgData = {
			_id: Random.id(),
			theme: baseTheme._id,
			title: "Test Org",
			ask: 100000,
			chitVotes: {
				count: 0,
				weight: 114,
			},
			amountFromVotes: 0,
			topOff: 0,
			pledges: [],
			leverageFunds: 0,
			createdAt: new Date(),
		}

		const votes = calculateVotesFromRawOrg(org, baseSettings, baseTheme)
		expect(votes).to.equal(38)
	})

	it("Should use chitVotesByOrg when useKioskChitVoting is true", function() {
		const orgId = Random.id()
		const org: OrgData = {
			_id: orgId,
			theme: baseTheme._id,
			title: "Test Org",
			ask: 100000,
			chitVotes: {
				count: 42,
				weight: 0,
			},
			amountFromVotes: 0,
			topOff: 0,
			pledges: [],
			leverageFunds: 0,
			createdAt: new Date(),
		}

		const settings: SettingsData = {
			...baseSettings,
			useKioskChitVoting: true,
		}

		const chitVotesByOrg: Record<string, number> = {
			[orgId]: 50,
		}

		const votes = calculateVotesFromRawOrg(org, settings, baseTheme, chitVotesByOrg)
		expect(votes).to.equal(50)
	})
})
