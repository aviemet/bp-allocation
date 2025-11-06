import { expect } from "chai"
import { resetDatabase } from "meteor/xolvio:cleaner"

import { PresentationSettings } from "/imports/api/db"
import { PresentationSettingsMethods } from "/imports/api/methods"

var settings

describe("Presentation Settings Methods", async function() {

	before(async function(done) {
		resetDatabase()

		try {
			const settingsId = await PresentationSettingsMethods.create.call()
			settings = await PresentationSettings.find({ _id: settingsId }).fetch()[0]
		} catch (e) {
			console.error("Error: ", e)
		} finally {
			done()
		}
	})

	/**
	 * Create
	 */
	describe("Create", function() {

		it("Should create a record", function() {
			expect(settings).to.not.be.undefined
		})

	})

	/**
	 * Update
	 */
	describe("Update", function() {

		it("Should update specified fields on the object", async function(done) {
			const settingsChange = {
				currentPage: "orgs",
				timerLength: 800,
				animateOrgs: false,
				leverageVisible: true,
				savesVisible: true,
				colorizeOrgs: true,
				chitVotingActive: true,
				fundsVotingActive: true,
				resultsOffset: 100,
				useKioskChitVoting: true,
				useKioskFundsVoting: true,
			}
			await PresentationSettingsMethods.update.callAsync({ id: settings._id, data: settingsChange })
			settings = PresentationSettings.find({ _id: settings._id }).fetch()[0]
			expect(settings).to.include(settingsChange)
			done()
		})

	})

})
