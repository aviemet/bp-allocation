import { faker } from "@faker-js/faker"
import { expect } from "chai"
import { Random } from "meteor/random"

import { OrganizationMethods } from "/imports/api/methods"

const OrgTestData = () => {
	return {
		title: faker.company.name(),
		ask: faker.number.int(),
		theme: Random.id(),
	}
}

describe("Organization Methods", async function() {

	/**
	 * Create
	 */
	describe("Create", function() {

		it("Should create a record", async function() {
			let orgId
			try {
				orgId = await OrganizationMethods.create.callAsync(OrgTestData())
			} catch (e) {
				console.error(e)
			} finally {
				expect(orgId).to.not.be.undefined
			}
		})

	})

	/**
	 * Update
	 */
	/* context("Update", function() {

		it("Should update specified fields on the object", function() {
			const orgChange = {
				title: faker.company.name()
			}
		const beforeOrg = Organizations.findOne({}, async function(err, org) {
			await OrganizationMethods.update.callAsync({ id: beforeOrg._id, data: orgChange })
			const afterOrg = Organizations.findOne({ _id: beforeOrg._id })
			expect(afterOrg).to.include(orgChange)
		})

		})

	}) */

})
