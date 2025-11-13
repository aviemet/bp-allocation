import { faker } from "@faker-js/faker"
import { assert, expect } from "chai"
import { Random } from "meteor/random"

import { Themes, DEFAULT_NUM_TOP_ORGS } from "/imports/api/db"
import { Theme } from "/imports/types"

const themeData: Partial<Theme> = {
	title: faker.lorem.words(1),
	question: faker.lorem.words(3),
	quarter: "2019Q1",
	presentationSettings: Random.id(),
	numTopOrgs: DEFAULT_NUM_TOP_ORGS,
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
