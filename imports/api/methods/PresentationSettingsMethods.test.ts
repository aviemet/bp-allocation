import { expect } from "chai"

import { PresentationSettings, SettingsData } from "/imports/api/db"
import { PresentationSettingsMethods } from "/imports/api/methods"
import { resetDatabase } from "../../tests/resetDatabase"

let settings: SettingsData

describe("Presentation Settings Methods", function() {

	before(async function() {
		resetDatabase()

		const settingsId = await PresentationSettingsMethods.create.callAsync({})
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
