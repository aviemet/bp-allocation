import { assert, expect } from 'chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { PresentationSettings } from '/imports/api';

/** Things to test:
 * - Required fields are required
 * - Validation
 * - Permissions
 */

const settingsDefaults = { 
	currentPage: 'intro',
	timerLength: 600,
	animateOrgs: true,
	leverageVisible: false,
	savesVisible: false,
	colorizeOrgs: false,
	chitVotingActive: false,
	fundsVotingActive: false,
	resultsOffset: 0,
	useKioskChitVoting: false,
	useKioskFundsVoting: false 
};

let presentationSettings;

describe("PresentationSettings model", function() {
	before(function() {
		resetDatabase();
		presentationSettings = PresentationSettings.insert({});
	});

	context("Creating a record", function() {


		it("Should return an _id when succesful", function() {
			expect(presentationSettings).to.not.be.null;
		});

		it("Should have default values", function() {
			let settings = PresentationSettings.find({ _id: presentationSettings }).fetch()[0];
			expect(settings).to.include(settingsDefaults);
		});

	});
});