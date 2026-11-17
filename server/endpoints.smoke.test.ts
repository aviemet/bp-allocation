import { expect } from "chai"
import { Meteor } from "meteor/meteor"
import { Random } from "meteor/random"

import { resolveAppRouteSmokePaths } from "/imports/lib/endpoints/appRoutePaths"

const absoluteUrl = (path: string): string => {
	const base = Meteor.absoluteUrl().replace(/\/$/, "")
	return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

describe("client route endpoints smoke", function() {
	it("serves every app route path without a server error", async function() {
		const paths = resolveAppRouteSmokePaths({
			themeId: Random.id(),
			themeSlug: "smoke",
			orgId: Random.id(),
			memberId: Random.id(),
			memberCode: "SM1",
			messageId: Random.id(),
			messageType: "text",
		})

		for(const path of paths) {
			const response = await fetch(absoluteUrl(path), {
				redirect: "manual",
			})
			expect(
				response.status,
				`GET ${path} returned ${response.status}`,
			).to.be.lessThan(500)
			expect(
				response.status,
				`GET ${path} should not be missing`,
			).to.not.equal(404)
		}
	})
})
