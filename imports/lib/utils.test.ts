import { expect } from "chai"

import { sanitizeNames, formatPhoneNumber } from "/imports/lib/utils"

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

	it("Shouldn't format empty strings", () => {
		const empty = ""
		expect(formatPhoneNumber(empty)).to.equal("")
	})

})
