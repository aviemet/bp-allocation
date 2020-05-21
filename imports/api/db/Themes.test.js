import { assert, expect } from 'chai'
import { Random } from 'meteor/random'
import faker from 'faker'
import { Themes } from '/imports/api/db'

/** Things to test:
 * - Required fields are required
 * - Validation
 * - Permissions
 */

const themeData = {
	title: faker.random.words(1),
	question: faker.random.words(3),
	qarter: "2019Q1",
	presentationSettings: Random.id()
}

describe("Themes model", function() {
	describe("Creating a record", function() {

		it("Should return an _id when succesful", function() {
			let theme = Themes.insert(themeData)
			assert.notEqual(theme, null)
		})

		describe("Validates presence of", function() {
			it("title", function() {
				expect(function() {
					Themes.insert(Object.assign(themeData, {title: undefined}))
				}).to.throw()
			})

			it("presentationSettings", function() {
				expect(function() {
					Themes.insert(Object.assign(themeData, {presentationSettings: undefined}))
				}).to.throw()
			})
		})

	})
})