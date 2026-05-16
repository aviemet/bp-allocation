import { expect } from "chai"

import { consolationTotal, startingFundsTotal } from "./themeTotals"

describe("themeTotals", function() {
	it("consolationTotal is org count minus top slots times amount when active", function() {
		expect(consolationTotal({
			consolationActive: true,
			numTopOrgs: 10,
			organizations: new Array(12).fill(""),
			consolationAmount: 400,
		})).to.equal(800)
		expect(consolationTotal({ consolationActive: false, numTopOrgs: 10, organizations: [] })).to.equal(0)
	})

	it("startingFundsTotal is top count times minimum when active", function() {
		expect(startingFundsTotal({
			minStartingFundsActive: true,
			numTopOrgs: 5,
			minStartingFunds: 900,
		})).to.equal(4500)
		expect(startingFundsTotal({
			minStartingFundsActive: false,
			numTopOrgs: 5,
			minStartingFunds: 900,
		})).to.equal(0)
	})
})
