import { expect } from "chai"
import { resetDatabase } from "meteor/xolvio:cleaner"
import { _ } from "meteor/underscore"

import { PresentationSettings } from "/imports/api/db"
import { PresentationSettingsMethods } from "/imports/api/methods"

;(globalThis as { _: typeof _ | undefined })._ = _

let settings

describe("Presentation Settings Methods", function() {

	before(async function() {
		resetDatabase()

		const settingsId = await PresentationSettingsMethods.create.callAsync()
		settings = (await PresentationSettings.find({ _id: settingsId }).fetchAsync())[0]
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

		it("Should update specified fields on the object", async function() {
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
			settings = (await PresentationSettings.find({ _id: settings._id }).fetchAsync())[0]
			expect(settings).to.include(settingsChange)
		})

	})

})
