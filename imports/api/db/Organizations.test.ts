import { faker } from "@faker-js/faker"
import { expect } from "chai"
import { Random } from "meteor/random"

import { Organizations } from "/imports/api/db"

/** Things to test:
 * - Required fields are required
 * - Validation
 * - Permissions
 */

const orgData = {
	title: faker.company.name(),
	ask: faker.number.int({ min: 100000, max: 400000 }),
	theme: Random.id(),
}

const orgDefaults = {
	chitVotes: {
		weight: 0,
		count: 0,
	},
	amountFromVotes: 0,
	topOff: 0,
	pledges: [],
	leverageFunds: 0,
}

describe("Organizations model", function() {
	describe("Creating a record", function() {

		it("Should return an _id when succesful", async function() {
			const orgId = await Organizations.insertAsync({ ...orgData })
			expect(orgId).to.not.be.null
		})

		it("Should have default values", async function() {
			const title = faker.company.name()
			const orgId = await Organizations.insertAsync({ ...orgData, title })
			const org = (await Organizations.find({ _id: orgId }).fetchAsync())[0]
			expect(org).to.deep.include(orgDefaults)
		})

		describe("Validates presence of", function() {
			it("title", async function() {
				try {
					await Organizations.insertAsync({ ...orgData, title: undefined })
					throw new Error("Expected schema validation to fail")
				} catch (error) {
					expect(error).to.exist
				}
			})

			it("ask", async function() {
				try {
					await Organizations.insertAsync({ ...orgData, ask: undefined })
					throw new Error("Expected schema validation to fail")
				} catch (error) {
					expect(error).to.exist
				}
			})
		})

	})
})
