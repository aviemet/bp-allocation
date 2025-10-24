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

		it("Should return an _id when succesful", function() {
			let memberTheme = MemberThemes.insert(memberThemeData)
			expect(memberTheme).to.not.be.null
		})

		it("Should have default values", function() {
			let memberTheme = MemberThemes.find({ theme: memberThemeData.theme }).fetch()[0]
			expect(memberTheme).to.deep.include(memberThemeDefaults)
		})

		describe("Validates presence of", function() {
			it("theme", function() {
				expect(function() {
					MemberThemes.insert(Object.assign(memberThemeData, { theme: undefined }))
				}).to.throw()
			})

			it("member", function() {
				expect(function() {
					MemberThemes.insert(Object.assign(memberThemeData, { member: undefined }))
				}).to.throw()
			})
		})

	})
})
