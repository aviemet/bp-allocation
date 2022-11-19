import { assert, expect } from 'chai'
import faker from 'faker'
import { Random } from 'meteor/random'

import { Members } from '/imports/api/db'

const memberData = {
	number: faker.random.number(1000),
	firstName: faker.name.firstName(),
	lastName: faker.name.lastName(),
}

describe('Members model', function() {
	describe('Creating a record', function() {

		it('Should return an _id when succesful', function() {
			let member = Members.insert(memberData)
			expect(member).to.not.be.null
		})

	})
})
