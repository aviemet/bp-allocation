import { expect } from "chai"

import {
	deriveActiveMenuItem,
	isAdminShellPath,
	isLivePresentationPath,
} from "./adminNavContext"

describe("adminNavContext", function() {
	describe("isAdminShellPath", function() {
		it("matches /admin and nested admin paths", function() {
			expect(isAdminShellPath("/admin")).to.equal(true)
			expect(isAdminShellPath("/admin/")).to.equal(true)
			expect(isAdminShellPath("/admin/abc/orgs")).to.equal(true)
			expect(isAdminShellPath("/kiosk/abc")).to.equal(false)
		})
	})

	describe("isLivePresentationPath", function() {
		it("matches only the presentation control deck route", function() {
			expect(isLivePresentationPath("/admin/abc/presentation")).to.equal(true)
			expect(isLivePresentationPath("/admin/abc/presentation/")).to.equal(true)
			expect(isLivePresentationPath("/admin/abc/orgs")).to.equal(false)
			expect(isLivePresentationPath("/admin/abc/presentation/xyz")).to.equal(false)
			expect(isLivePresentationPath("/admin")).to.equal(false)
		})
	})

	describe("deriveActiveMenuItem", function() {
		it("returns themes on the themes list", function() {
			expect(deriveActiveMenuItem("/admin")).to.equal("themes")
		})

		it("returns the first segment after theme id", function() {
			expect(deriveActiveMenuItem("/admin/abc/orgs")).to.equal("orgs")
			expect(deriveActiveMenuItem("/admin/abc/settings/general")).to.equal("settings")
			expect(deriveActiveMenuItem("/admin/abc/presentation")).to.equal("presentation")
		})
	})
})
