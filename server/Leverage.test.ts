import { expect } from "chai"
import { Leverage } from "/imports/lib/Leverage"
import { Education } from "/imports/test-support/mocks/Education.mock"
import { Democracy } from "/imports/test-support/mocks/Democracy.mock"
import { Youth } from "/imports/test-support/mocks/Youth.mock"
import { filterTopOrgs } from "/imports/lib/orgsMethods"

describe("Leverage object", function() {

	describe("Leverage object initalized correctly", function() {
		const leverage = new Leverage(Youth.orgs, 100)

		it("Should have 5 orgs", function() {
			expect(leverage.orgs.length).to.equal(5)
		})

	})
})

describe("Education Theme leverage spread", function() {
	const topOrgs = filterTopOrgs(Education.orgs, Education.theme)

	it("Should generate leverage rounds", function() {
		const leverage = new Leverage(topOrgs, 639169.6)
		const rounds = leverage.getLeverageSpreadRounds()
		expect(rounds).to.be.an("array").that.is.not.empty
		expect(rounds.length).to.equal(1)
	})

	it("Should spread leverage correctly to the orgs - Education", function() {
		const leverage = new Leverage(topOrgs, 639169.6)
		const rounds = leverage.getLeverageSpreadRounds()
		const orgSpreadByRound: Record<string, number[]> = {
			"7JudfyraRLNbLAQuF": [66600],
			"iMJiLfte2Wo4i6YwS": [0],
			"qhLLMjGwGNr3frshr": [109244.73],
			"6tTw6bLwrdBxeGQpp": [157205.83],
			"SuyDNaJyrbBmDJZZM": [90814.34],
			"j687kt5CtszAmyeL6": [126297.57],
		}
		rounds.forEach((round, nRounds) => {
			round.orgs.forEach(org => {
				expect(org.roundFunds).to.equal(orgSpreadByRound[org._id]?.[nRounds])
			})
		})
	})
})

describe("Democracy Theme leverage spread", function() {

	it("Should generate leverage rounds", function() {
		const leverage = new Leverage(Democracy.orgs, 802759)
		const rounds = leverage.getLeverageSpreadRounds()
		expect(rounds).to.be.an("array").that.is.not.empty
		expect(rounds.length).to.equal(1)
	})

	it("Should spread leverage correctly to the orgs - Democracy", function() {
		const leverage = new Leverage(Democracy.orgs, 802759)
		const rounds = leverage.getLeverageSpreadRounds()
		const orgSpreadByRound: Record<string, number[]> = {
			"iBTQcWD9NZppHfrJ8": [161707.25],
			"497FQGwnAhRCN7fh3": [171800],
			"wcZzEZyWJP7m2dXMd": [151805.22],
			"MhaovtXsWG4HgeiZL": [175400],
			"GnqeDtd4nhvkBqt8L": [0],
		}
		rounds.forEach((round, nRounds) => {
			round.orgs.forEach(org => {
				expect(org.roundFunds).to.equal(orgSpreadByRound[org._id]?.[nRounds])
			})
		})
	})
})
