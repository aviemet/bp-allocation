import { expect } from "chai"
import { Random } from "meteor/random"

import { MemberThemes } from "/imports/api/db"

const memberThemeData = {
	theme: Random.id(),
	member: Random.id(),
}

const memberThemeDefaults = {
	chitVotes: [],
	allocations: [],
}

describe("MemberThemes model", function() {
	describe("Creating a record", function() {

		it("Should return an _id when succesful", async function() {
			const memberThemeId = await MemberThemes.insertAsync({ ...memberThemeData })
			expect(memberThemeId).to.not.be.null
		})

		it("Should have default values", async function() {
			const memberThemeId = await MemberThemes.insertAsync({ ...memberThemeData })
			const memberTheme = (await MemberThemes.find({ _id: memberThemeId }).fetchAsync())[0]
			expect(memberTheme).to.deep.include(memberThemeDefaults)
		})

		describe("Validates presence of", function() {
			it("theme", async function() {
				try {
					await MemberThemes.insertAsync({ ...memberThemeData, theme: undefined })
					throw new Error("Expected schema validation to fail")
				} catch (error) {
					expect(error).to.exist
				}
			})

			it("member", async function() {
				try {
					await MemberThemes.insertAsync({ ...memberThemeData, member: undefined })
					throw new Error("Expected schema validation to fail")
				} catch (error) {
					expect(error).to.exist
				}
			})
		})

	})
})
