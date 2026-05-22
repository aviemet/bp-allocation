import { expect } from "chai"

import { formatPhoneNumber, sanitizeNames } from "/imports/lib/utils"

describe("Name sanitizer", () => {
	it("Should rearrange names in the form 'Last, First'", () => {
		const jared = "Barragan-Grigsby, Jared A"
		const rodolfo = "Barron Romero, Rodolfo A"
		const avram = "Walden, Avram True"
		const max = "Manker, Max "

		expect(sanitizeNames(jared)).to.equal("Jared A Barragan-Grigsby")
		expect(sanitizeNames(rodolfo)).to.equal("Rodolfo A Barron Romero")
		expect(sanitizeNames(avram)).to.equal("Avram True Walden")
		expect(sanitizeNames(max)).to.equal("Max Manker")
	})

	it("Should not alter names in the form 'First Last'", () => {
		const tommy = "Tommy Scully"
		expect(sanitizeNames(tommy)).to.equal("Tommy Scully")
	})
})

describe("Phone formatter", () => {
	it("Should strip all non-numeric or + characters", () => {
		const phone1 = "(808) 430-3275"
		const phone2 = "415.230.8099"
		expect(formatPhoneNumber(phone1)).to.equal("+18084303275")
		expect(formatPhoneNumber(phone2)).to.equal("+14152308099")
	})

	it("Should add +1 to numbers without an international code", () => {
		const phone = "4152308099"
		expect(formatPhoneNumber(phone)).to.equal("+14152308099")
		expect(formatPhoneNumber("1" + phone)).to.equal("+14152308099")
	})

	it("Should not edit numbers in international format", () => {
		const phone1 = "+31655734926"
		const phone2 = "+14152308099"
		expect(formatPhoneNumber(phone1)).to.equal(phone1)
		expect(formatPhoneNumber(phone2)).to.equal(phone2)
	})

	it("Should parse UK numbers with a leading 0 trunk prefix", () => {
		expect(formatPhoneNumber("07971506000")).to.equal("+447971506000")
	})

	it("Should parse UK numbers with an explicit 44 country code", () => {
		expect(formatPhoneNumber("447971506000")).to.equal("+447971506000")
	})

	it("Should not prepend +1 to non-US numbers that are too long for NANP", () => {
		expect(formatPhoneNumber("85294904645")).to.equal("+85294904645")
		expect(formatPhoneNumber("971506000000")).to.equal("+971506000000")
	})

	it("Should parse numbers with a 00 international prefix", () => {
		expect(formatPhoneNumber("00447971506000")).to.equal("+447971506000")
	})

	it("Shouldn't format empty strings", () => {
		const empty = ""
		expect(formatPhoneNumber(empty)).to.equal("")
	})

})
