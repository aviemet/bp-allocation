import { expect } from "chai"
import { PresentationSettings } from "/imports/api/db"

/** Things to test:
 * - Required fields are required
 * - Validation
 * - Permissions
 */

const settingsDefaults = {
	currentPage: "intro",
	timerLength: 600,
	animateOrgs: true,
	leverageVisible: false,
	savesVisible: false,
	colorizeOrgs: false,
	chitVotingActive: false,
	fundsVotingActive: false,
	resultsOffset: 0,
	useKioskChitVoting: true,
	useKioskFundsVoting: true,
	resultsVisited: false,
	awardsPresentation: false,
	awardAmount: 0,
}

let presentationSettings

describe("PresentationSettings model", function() {
	before(async function() {
		presentationSettings = await PresentationSettings.insertAsync({})
	})

	describe("Creating a record", function() {


		it("Should return an _id when succesful", function() {
			expect(presentationSettings).to.not.be.null
		})

		it("Should have default values", async function() {
			const settings = (await PresentationSettings.find({ _id: presentationSettings }).fetchAsync())[0]
			expect(settings).to.include(settingsDefaults)
		})

	})
})
