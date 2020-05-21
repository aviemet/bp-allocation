import { assert, expect } from 'chai'
import { Random } from 'meteor/random'
import faker from 'faker'
import { Organizations } from '/imports/api/db'

/** Things to test:
 * - Required fields are required
 * - Validation
 * - Permissions
 */

const orgData = {
	title: faker.company.companyName(),
	ask: faker.random.number({min: 100000, max: 400000}),
	theme: Random.id()
}

const orgDefaults = {
	chitVotes: {
		weight: 0,
		count: 0
	},
	amountFromVotes: 0,
	topOff: 0,
	pledges: [],
	leverageFunds: 0
}

describe("Organizations model", function() {
	describe("Creating a record", function() {

		it("Should return an _id when succesful", function() {
			let org = Organizations.insert(orgData)
			expect(org).to.not.be.null
		})

		it("Should have default values", function() {
			let org = Organizations.find({ title: orgData.title }).fetch()[0]
			expect(org).to.deep.include(orgDefaults)
		})

		describe("Validates presence of", function() {
			it("title", function() {
				expect(function() {
					Organizations.insert(Object.assign(orgData, {title: undefined}))
				}).to.throw()
			})

			it("ask", function() {
				expect(function() {
					Organizations.insert(Object.assign(orgData, {ask: undefined}))
				}).to.throw()
			})
		})

	})
})