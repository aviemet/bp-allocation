import { expect } from "chai"

import { PAGES } from "/imports/lib/presentation/global"
import {
	APP_ROUTE_PATH_TEMPLATES,
	REGISTERED_METHOD_NAMES,
	REGISTERED_PUBLICATION_NAMES,
	SETTINGS_TAB_SLUGS,
	resolveAppRouteSmokePaths,
} from "/imports/lib/endpoints/appRoutePaths"

describe("appRoutePaths inventory", function() {
	it("lists every known client route template", function() {
		expect(APP_ROUTE_PATH_TEMPLATES).to.include("/admin/$id/presentation")
		expect(APP_ROUTE_PATH_TEMPLATES).to.include("/presentation/$id/$currentPage")
		expect(APP_ROUTE_PATH_TEMPLATES).to.include("/pledges/inperson/$themeId")
		expect(APP_ROUTE_PATH_TEMPLATES).to.include("/kiosk/$id")
		expect(new Set(APP_ROUTE_PATH_TEMPLATES).size).to.equal(APP_ROUTE_PATH_TEMPLATES.length)
	})

	it("expands smoke paths for every settings tab and presentation page", function() {
		const paths = resolveAppRouteSmokePaths({
			themeId: "theme1",
			themeSlug: "thm",
			orgId: "org1",
			memberId: "member1",
			memberCode: "AB1",
			messageId: "message1",
			messageType: "email",
		})

		for(const tab of SETTINGS_TAB_SLUGS) {
			expect(paths).to.include(`/admin/theme1/settings/${tab}`)
		}
		for(const page of PAGES) {
			expect(paths).to.include(`/presentation/theme1/${page}`)
		}
		expect(paths).to.include("/v/thm/AB1")
		expect(new Set(paths).size).to.equal(paths.length)
	})

	it("keeps publication and method inventories unique", function() {
		expect(new Set(REGISTERED_PUBLICATION_NAMES).size).to.equal(REGISTERED_PUBLICATION_NAMES.length)
		expect(new Set(REGISTERED_METHOD_NAMES).size).to.equal(REGISTERED_METHOD_NAMES.length)
	})
})
