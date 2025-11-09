import { expect } from "chai"
import { PresentationSettings } from "/imports/api/db"

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

let presentationSettingsId: string

describe("PresentationSettings model", function() {
	before(async function() {
		presentationSettingsId = await PresentationSettings.insertAsync({})
	})

	describe("Creating a record", function() {


		it("Should return an _id when succesful", function() {
			expect(presentationSettingsId).to.not.be.null
		})

		it("Should have default values", async function() {
			const settings = (await PresentationSettings.find({ _id: presentationSettingsId }).fetchAsync())[0]
			expect(settings).to.include(settingsDefaults)
		})

	})
})
