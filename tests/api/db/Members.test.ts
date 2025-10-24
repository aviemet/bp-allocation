import { expect } from "chai"
import { faker } from "@faker-js/faker"

import { Members } from "/imports/api/db"

const memberData = {
	number: faker.number.int({ max: 1000 }),
	firstName: faker.person.firstName(),
	lastName: faker.person.lastName(),
}

describe("Members model", function() {
	describe("Creating a record", function() {

		it("Should return an _id when succesful", function() {
			let member = Members.insert(memberData)
			expect(member).to.not.be.null
		})

	})
})
