import { faker } from "@faker-js/faker"
import { assert, expect } from "chai"
import { Random } from "meteor/random"

import { type ThemeData, Themes } from "/imports/api/db"

/** Things to test:
 * - Required fields are required
 * - Validation
 * - Permissions
 */

const themeData: Partial<ThemeData> = {
	title: faker.lorem.words(1),
	question: faker.lorem.words(3),
	quarter: "2019Q1",
	presentationSettings: Random.id(),
}

describe("Themes model", function() {
	describe("Creating a record", function() {

		it("Should return an _id when succesful", async function() {
			const themeId = await Themes.insertAsync({ ...themeData })
			assert.notEqual(themeId, null)
		})

		describe("Validates presence of", function() {
			it("title", async function() {
				try {
					await Themes.insertAsync({ ...themeData, title: undefined })
					throw new Error("Expected schema validation to fail")
				} catch (error) {
					expect(error).to.exist
				}
			})

			it("presentationSettings", async function() {
				try {
					await Themes.insertAsync({ ...themeData, presentationSettings: undefined })
					throw new Error("Expected schema validation to fail")
				} catch (error) {
					expect(error).to.exist
				}
			})
		})

	})
})
