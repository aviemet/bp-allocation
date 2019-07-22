import { expect } from 'chai';
import faker from 'faker';
import { Random } from 'meteor/random';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import { Organizations, Themes } from '/imports/api';
import { OrganizationMethods } from '/imports/api/methods';

const OrgTestData = (id) => {
	return {
		title: faker.company.companyName(),
		ask: faker.random.number(),
		theme: Random.id()
	}
}

describe("Organization Methods", async function() {

	before(function() {
		resetDatabase();
	});

	/**
	 * Create
	 */
	context("Create", function() {

		it("Should create a record", function() {
			let orgId;
			try {
				orgId = OrganizationMethods.create.call(OrgTestData());
			} catch(e) {
				console.error(e);
			} finally {
				expect(orgId).to.not.be.undefined;
			}
		});

	});

	/**
	 * Update
	 */
	context("Update", function() {

		it("Should update specified fields on the object", async function() {
			const orgChange = {
				title: faker.company.companyName()
			};

			const beforeOrg = await Organizations.findOne();
			await OrganizationMethods.update.call({ id: beforeOrg._id, data: orgChange });
			const afterOrg = await Organizations.findOne({ _id: beforeOrg._id });

			expect(afterOrg).to.include(orgChange);
		});

	});

});
