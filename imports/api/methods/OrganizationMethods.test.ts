import { faker } from "@faker-js/faker"
import { expect } from "chai"
import { Random } from "meteor/random"

import { OrganizationMethods, ThemeMethods } from "/imports/api/methods"
import { Organizations, Themes } from "/imports/api/db"
import { resetDatabase } from "/imports/test-support/resetDatabase"

const OrgTestData = (themeId?: string) => {
	return {
		title: faker.company.name(),
		ask: faker.number.int({ min: 1000, max: 1000000 }),
		theme: themeId ?? Random.id(),
	}
}

describe("Organization Methods", function() {

	let themeId: string

	beforeEach(async function() {
		await resetDatabase()
		const newThemeId = await ThemeMethods.create.callAsync({
			title: faker.company.buzzNoun() + "-" + faker.string.alpha(4),
		})
		if(!newThemeId) throw new Error("Failed to create theme")
		themeId = newThemeId
	})

	describe("Create", function() {
		it("Should create a record", async function() {
			const { response, error } = await OrganizationMethods.create.callAsync(OrgTestData(themeId))
			expect(error).to.be.undefined
			expect(response).to.be.a("string")
		})

		it("Should push the new org id onto the parent theme's organizations array", async function() {
			const { response: orgId } = await OrganizationMethods.create.callAsync(OrgTestData(themeId))
			const theme = await Themes.findOneAsync({ _id: themeId })
			expect(theme?.organizations).to.include(orgId)
		})
	})

	describe("Update", function() {
		it("Should set specified fields on the org", async function() {
			const { response: orgId } = await OrganizationMethods.create.callAsync(OrgTestData(themeId))
			if(!orgId) throw new Error("Failed to create org")

			const newTitle = faker.company.name()
			await OrganizationMethods.update.callAsync({ id: orgId, data: { title: newTitle } })

			const org = await Organizations.findOneAsync({ _id: orgId })
			expect(org?.title).to.equal(newTitle)
		})
	})

	describe("Remove", function() {
		it("Should delete the org document", async function() {
			const { response: orgId } = await OrganizationMethods.create.callAsync(OrgTestData(themeId))
			if(!orgId) throw new Error("Failed to create org")

			await OrganizationMethods.remove.callAsync(orgId)
			const org = await Organizations.findOneAsync({ _id: orgId })
			expect(org).to.be.undefined
		})

		it("Should pull the org id from the parent theme's organizations array", async function() {
			const { response: orgId } = await OrganizationMethods.create.callAsync(OrgTestData(themeId))
			if(!orgId) throw new Error("Failed to create org")

			await OrganizationMethods.remove.callAsync(orgId)
			const theme = await Themes.findOneAsync({ _id: themeId })
			expect(theme?.organizations).to.not.include(orgId)
		})

		it("Should throw when the org does not exist", async function() {
			let threw = false
			try {
				await OrganizationMethods.remove.callAsync(Random.id())
			} catch (_e) {
				threw = true
			}
			expect(threw).to.be.true
		})
	})

	describe("RemoveMany", function() {
		it("Should delete all listed orgs", async function() {
			const ids: string[] = []
			for(let index = 0; index < 3; index++) {
				const { response } = await OrganizationMethods.create.callAsync(OrgTestData(themeId))
				if(response) ids.push(response)
			}

			await OrganizationMethods.removeMany.callAsync(ids)
			const remaining = await Organizations.find({ _id: { $in: ids } }).countAsync()
			expect(remaining).to.equal(0)
		})
	})

	describe("Pledge", function() {
		it("Should push a pledge entry onto the org", async function() {
			const { response: orgId } = await OrganizationMethods.create.callAsync(OrgTestData(themeId))
			if(!orgId) throw new Error("Failed to create org")

			const memberId = Random.id()
			await OrganizationMethods.pledge.callAsync({
				id: orgId,
				amount: 1234.56,
				member: memberId,
				anonymous: true,
			})

			const org = await Organizations.findOneAsync({ _id: orgId })
			expect(org?.pledges).to.have.length(1)
			const pledge = org!.pledges![0]
			expect(pledge.amount).to.equal(1234.56)
			expect(pledge.member).to.equal(memberId)
			expect(pledge.anonymous).to.equal(true)
		})

		it("Should round the amount to two decimals", async function() {
			const { response: orgId } = await OrganizationMethods.create.callAsync(OrgTestData(themeId))
			if(!orgId) throw new Error("Failed to create org")

			await OrganizationMethods.pledge.callAsync({
				id: orgId,
				amount: 100.123456,
				member: Random.id(),
			})

			const org = await Organizations.findOneAsync({ _id: orgId })
			expect(org?.pledges?.[0].amount).to.equal(100.12)
		})
	})

	describe("RemovePledge", function() {
		it("Should pull only the matching pledge by _id", async function() {
			const { response: orgId } = await OrganizationMethods.create.callAsync(OrgTestData(themeId))
			if(!orgId) throw new Error("Failed to create org")

			await OrganizationMethods.pledge.callAsync({ id: orgId, amount: 50, member: Random.id() })
			await OrganizationMethods.pledge.callAsync({ id: orgId, amount: 75, member: Random.id() })

			const beforeOrg = await Organizations.findOneAsync({ _id: orgId })
			expect(beforeOrg?.pledges).to.have.length(2)
			const [keepPledge, dropPledge] = beforeOrg!.pledges!
			expect(keepPledge._id, "Schema autoValue should generate unique pledge ids on $push").to.not.equal(dropPledge._id)

			await OrganizationMethods.removePledge.callAsync({ orgId, pledgeId: dropPledge._id })

			const afterOrg = await Organizations.findOneAsync({ _id: orgId })
			expect(afterOrg?.pledges).to.have.length(1)
			expect(afterOrg?.pledges?.[0]._id).to.equal(keepPledge._id)
		})
	})

	describe("RemovePledgeById", function() {
		it("Should pull pledges across every org in the theme", async function() {
			const orgIds: string[] = []
			for(let index = 0; index < 2; index++) {
				const { response } = await OrganizationMethods.create.callAsync(OrgTestData(themeId))
				if(response) orgIds.push(response)
			}

			await OrganizationMethods.pledge.callAsync({ id: orgIds[0], amount: 10, member: Random.id() })
			await OrganizationMethods.pledge.callAsync({ id: orgIds[0], amount: 99, member: Random.id() })
			await OrganizationMethods.pledge.callAsync({ id: orgIds[1], amount: 20, member: Random.id() })

			const orgs = await Organizations.find({ _id: { $in: orgIds } }).fetchAsync()
			const allPledges = orgs.flatMap(org => org.pledges ?? [])
			const keepPledge = allPledges.find(pledge => pledge.amount === 99)
			if(!keepPledge) throw new Error("Expected to find the keep pledge")
			const pledgeIdsToRemove = allPledges
				.filter(pledge => pledge._id !== keepPledge._id)
				.map(pledge => pledge._id)

			await OrganizationMethods.removePledgeById.callAsync({ themeId, pledgeIds: pledgeIdsToRemove })

			const after = await Organizations.find({ _id: { $in: orgIds } }).fetchAsync()
			const remaining = after.flatMap(org => org.pledges ?? [])
			expect(remaining).to.have.length(1)
			expect(remaining[0]._id).to.equal(keepPledge._id)
		})

		it("Should accept a single pledge id (non-array)", async function() {
			const { response: orgId } = await OrganizationMethods.create.callAsync(OrgTestData(themeId))
			if(!orgId) throw new Error("Failed to create org")

			await OrganizationMethods.pledge.callAsync({ id: orgId, amount: 100, member: Random.id() })
			const beforeOrg = await Organizations.findOneAsync({ _id: orgId })
			const pledgeId = beforeOrg!.pledges![0]._id

			await OrganizationMethods.removePledgeById.callAsync({ themeId, pledgeIds: pledgeId })

			const after = await Organizations.findOneAsync({ _id: orgId })
			expect(after?.pledges).to.be.empty
		})

		it("Should return 0 when the theme does not exist", async function() {
			const result = await OrganizationMethods.removePledgeById.callAsync({
				themeId: Random.id(),
				pledgeIds: [Random.id()],
			})
			expect(result).to.equal(0)
		})
	})

	describe("TopOff", function() {
		it("Should compute topOff as ask minus amountFromVotes minus pledges", async function() {
			const { response: orgId } = await OrganizationMethods.create.callAsync({
				...OrgTestData(themeId),
				ask: 10000,
				amountFromVotes: 3000,
			})
			if(!orgId) throw new Error("Failed to create org")

			await OrganizationMethods.pledge.callAsync({ id: orgId, amount: 2000, member: Random.id() })

			await OrganizationMethods.topOff.callAsync({ id: orgId })
			const org = await Organizations.findOneAsync({ _id: orgId })
			expect(org?.topOff).to.equal(10000 - 3000 - 2000)
		})

		it("Should set topOff to 0 when negate is true", async function() {
			const { response: orgId } = await OrganizationMethods.create.callAsync({
				...OrgTestData(themeId),
				ask: 10000,
				amountFromVotes: 3000,
			})
			if(!orgId) throw new Error("Failed to create org")

			await OrganizationMethods.topOff.callAsync({ id: orgId })
			await OrganizationMethods.topOff.callAsync({ id: orgId, negate: true })

			const org = await Organizations.findOneAsync({ _id: orgId })
			expect(org?.topOff).to.equal(0)
		})

		it("Should return 0 when the org does not exist", async function() {
			const result = await OrganizationMethods.topOff.callAsync({ id: Random.id() })
			expect(result).to.equal(0)
		})
	})

	describe("Reset", function() {
		it("Should clear pledges, amountFromVotes, and topOff", async function() {
			const { response: orgId } = await OrganizationMethods.create.callAsync({
				...OrgTestData(themeId),
				ask: 10000,
				amountFromVotes: 5000,
				topOff: 250,
			})
			if(!orgId) throw new Error("Failed to create org")

			await OrganizationMethods.pledge.callAsync({ id: orgId, amount: 100, member: Random.id() })

			await OrganizationMethods.reset.callAsync({ id: orgId })

			const org = await Organizations.findOneAsync({ _id: orgId })
			expect(org?.pledges).to.be.empty
			expect(org?.amountFromVotes).to.equal(0)
			expect(org?.topOff).to.equal(0)
		})
	})
})
