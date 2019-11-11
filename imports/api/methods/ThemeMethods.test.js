import { expect } from 'chai';
import faker from 'faker';
// import { Random } from 'meteor/random';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import { ThemeMethods } from '/imports/api/methods';
import { Themes, Organizations } from '/imports/api';

const themeData = {
	title: faker.company.bsNoun(),
	leverage: 1200000
};

// Will get populated by before method
let orgIds = [];
var theme;
var orgId;
var numTopOrgsDefault;

describe("Theme Methods", async function() {

	before(async function(done) {
		resetDatabase();

		try {
			// Create a test Theme record
			let themeId = await ThemeMethods.create.call(themeData);
			theme = await Themes.find({ _id: themeId }).fetch()[0];
			themeData._id = theme._id;
			numTopOrgsDefault = theme.numTopOrgs;

			// Add some associated test Organization records
			for(let i = 0; i < 5; i++) {
				const orgId = await Organizations.insert({
					title: faker.company.companyName(),
					ask: faker.random.number(),
					theme: theme._id,
					leverageFunds: themeData.leverage / 5
				});
				orgIds.push(orgId); // Save list of org ids for later test
			}
		} catch(e) {
			console.error("Error: ", e);
		} finally {
			done();
		}
	});

	/**
	 * Create
	 */
	context("Create", function() {

		it("Should create a Theme", function() {
			expect(theme).to.not.be.undefined;
		});

		it("Should create a nested PresentationSettings object", function() {
			expect(theme).to.have.property('presentationSettings');
		})

	});

	/**
	 * Top Org Toggle
	 */
	context("TopOrgToggle", function() {
		it("Should add an org id to the set of topOrgsManual", async function(done) {
			orgId = orgIds[ 0 ];

			try {
				await ThemeMethods.topOrgToggle.call({ theme_id: theme._id, org_id: orgId });
				theme = Themes.find({ _id: theme._id }).fetch()[0];
			} catch(e) {
				console.error("Error: ", e);
				done();
			} finally {
				expect(theme.topOrgsManual).to.include(orgId);
				done();
			}
		});

		it("Should remove an org id from the set of topOrgsManual", async function(done) {
			try {
				await ThemeMethods.topOrgToggle.call({ theme_id: theme._id, org_id: orgId });
				theme = Themes.find({ _id: theme._id }).fetch()[0];
			} catch(e) {
				console.error("Error: ", e);
				done();
			} finally {
				expect(theme.topOrgsManual).to.not.include(orgId);
				done();
			}
		});

	});

	/**
	 * Save Org
	 */
	context("SaveOrg", function() {

		it("Should add a save record to the theme", function() {
			orgId = orgIds[ faker.random.number({min: 0, max: (orgIds.length - 1)}) ];
			const amount = faker.random.number();
			try {
				ThemeMethods.saveOrg.call({
					id: orgId,
					amount: amount
				});
				theme = Themes.find({ _id: theme._id }).fetch()[0];
			} catch(e) {
				console.error("Error ", e);
			}

			expect(theme.saves[0]).to.include({ org: orgId, amount: amount });
		});

		it("Should increment numTopOrgs", function() {
			expect(theme.numTopOrgs).to.equal(numTopOrgsDefault + 1);
		});

		it("Should add orgId to topOrgsManual", function() {
			expect(theme.topOrgsManual).to.include(orgId);
		});

	});

	/**
	 * Un Save Org
	 */
	context("UnSaveOrg", function() {

		it("Should remove a save record from the theme", function() {
			try {
				ThemeMethods.unSaveOrg.call({
					theme_id: theme._id,
					org_id: orgId
				});
				theme = Themes.find({ _id: theme._id }).fetch()[0];
			} catch(e) {
				console.error("Error ", e);
			}

			expect(theme.saves).to.be.empty;
		});

		it("Should increment numTopOrgs", function() {
			expect(theme.numTopOrgs).to.equal(numTopOrgsDefault);
		});

		it("Should add orgId to topOrgsManual", function() {
			expect(theme.topOrgsManual).to.not.include(orgId);
		});

	});

	/**
	 * Save Leverage Spread
	 */
	context("SaveLeverageSpread", function() {

		it("Should distribute the leverage amounts", function() {
			const leverage = themeData.leverage / 5;
			const orgs = orgIds.map(id => {
				return {
					_id: id,
					leverageFunds: leverage
				}
			});

			// Execute the method
			ThemeMethods.saveLeverageSpread.call(orgs);
			
			const orgRecords = Organizations.find({ _id: { $in: orgIds } });
			orgRecords.forEach(org => {
				expect(org.leverageFunds).to.equal(leverage);
			});

		});

	});

	/**
	 * Reset Leverage Spread
	 */
	context("ResetLeverage", function() {
		it.skip("Should set leverageFunds back to 0 for all orgs in theme", function() {
			const orgs = orgIds.map(id => {
				return { _id: id };
			});
			ThemeMethods.resetLeverage.call(orgs);
			theme = Themes.find({ _id: theme._id }).fetch()[0];
			const orgRecords = Organizations.find({ _id: { $in: orgIds } });
			orgRecords.forEach(org => {
				expect(org.leverageFunds).to.equal(0);
			});
		});
	});

	/**
	 * Update
	 */
	context("Update", function() {

		it("Should update specified fields on the object", async function(done) {
			const question = faker.company.bs();
			await ThemeMethods.update.call({ id: theme._id, data: {
				question: question,
			} });
			theme = Themes.find({ _id: theme._id }).fetch()[0];
			expect(theme.question).to.equal(question);
			done();
		});

	});

	context("Remove", function() {

	});
});