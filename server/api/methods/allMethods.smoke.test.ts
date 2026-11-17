import { expect } from "chai"

import "/imports/api/methods"
import "./staticSnapshotMethods"
import "./messagingMethods"
import { REGISTERED_METHOD_NAMES } from "/imports/lib/endpoints/appRoutePaths"
import { getMeteorDdpServer } from "/imports/test-support/meteorServer"

describe("all methods smoke", function() {
	it("registers every expected method handler", function() {
		const handlers = getMeteorDdpServer().method_handlers
		for(const name of REGISTERED_METHOD_NAMES) {
			expect(handlers[name], `missing method ${name}`).to.be.a("function")
		}
	})
})
