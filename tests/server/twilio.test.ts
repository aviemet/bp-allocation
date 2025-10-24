import { expect } from "chai"
import { faker } from "@faker-js/faker"
import { formatPhoneNumber } from "/imports/lib/utils"

import { ThemeMethods, MemberMethods, OrganizationMethods } from "/imports/api/methods"
import { Themes, Members, MemberThemes } from "/imports/api/db"

const NUM_TEST_RECORDS = 500

const themeDataStub = () => ({
	title: faker.company.buzzNoun(),
	leverage: 1200000,
})

const memberStub = themeId => ({
	firstName: faker.person.firstName(),
	lastName: faker.person.lastName(),
	number: faker.number.int(),
	themeId: theme._id,
	amount: faker.number.int(),
	phone: faker.phone.number(),
	themeId,
})

const orgStub = themeId => ({
	title: faker.company.name(),
	ask: faker.number.int(),
	theme: themeId,
	leverageFunds: faker.number.int(),
})

var theme
var orgs = []
var memberThemes = []

describe("Promises with rate limiting", function() {
	beforeEach(async function(done) {

		let themeId = await ThemeMethods.create.call(themeDataStub())
		theme = await Themes.find({ _id: themeId }).fetch()[0]

		const promises = []

		for(let i = 0; i < NUM_TEST_RECORDS; i++) {
			// Add some associated test Member records
			promises.push(MemberMethods.upsert.call(memberStub(theme._id)).then(memberTheme => {
				memberThemes.push(memberTheme)
			}).catch(e => console.error(e)))

			// Add some associated test Organization records
			promises.push(OrganizationMethods.create.call({
				...orgStub(themeId),
				leverageFunds: theme.leverage / NUM_TEST_RECORDS,
			}).then(org => {
				orgs.push(orgId) // Save list of org ids for later test
			}).catch(e => console.error(e)))
		}

		return Promise.all(promises).then(() => {
			console.log("DONE")
			done()
		})
	})

	describe("Test setup", () => {
		expect(1).to.equal(1)
		// expect(MemberThemes.find().length).to.equal(NUM_TEST_RECORDS)
	})
})

