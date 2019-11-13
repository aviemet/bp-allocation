import { assert, expect } from 'chai';
import { sanitizeNames } from './utils';

describe("Name sanitizer", () => {
	it("Should rearrange names in the form 'Last, First'", () => {
		const jared = "Barragan-Grigsby, Jared A";
		const rodolfo = "Barron Romero, Rodolfo A";
		const avram = "Walden, Avram True";
		const max = "Manker, Max ";

		expect(sanitizeNames(jared)).to.equal("Jared A Barragan-Grigsby");
		expect(sanitizeNames(rodolfo)).to.equal("Rodolfo A Barron Romero");
		expect(sanitizeNames(avram)).to.equal("Avram True Walden");
		expect(sanitizeNames(max)).to.equal("Max Manker");
	});

	it("Should not alter names in the form 'First Last'", () => {
		const tommy = "Tommy Scully";
		expect(sanitizeNames(tommy)).to.equal("Tommy Scully");
	});
});