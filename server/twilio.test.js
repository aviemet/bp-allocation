import { expect } from 'chai'
import faker from 'faker'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import { formatPhoneNumber } from '/imports/lib/utils'

import { ThemeMethods, MemberMethods, OrganizationMethods } from '/imports/api/methods'
import { Themes, Members, MemberThemes } from '/imports/api/db'

const NUM_TEST_RECORDS = 500

const themeDataStub = () => ({
	title: faker.company.bsNoun(),
	leverage: 1200000
})

const memberStub = themeId => ({
	firstName: faker.name.firstName(),
	lastName: faker.name.lastName(),
	number: faker.random.number(),
	themeId: theme._id,
	amount: faker.random.number(),
	phone: faker.phone.phoneNumber(),
	themeId
})

const orgStub = themeId => ({
	title: faker.company.companyName(),
	ask: faker.random.number(),
	theme: themeId,
	leverageFunds: faker.random.number()
})

var theme
var orgs = []
var memberThemes = []

describe("Promises with rate limiting", function() {
	beforeEach(async function(done) {
		resetDatabase()

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
				leverageFunds: theme.leverage / NUM_TEST_RECORDS
			}).then(org => {
				orgs.push(orgId) // Save list of org ids for later test
			}).catch(e => console.error(e)))
		}

		return Promise.all(promises).then(() => {
			console.log('DONE')
			done()
		})
	})

	context("Test setup", () => {
		expect(1).to.equal(1)
		// expect(MemberThemes.find().length).to.equal(NUM_TEST_RECORDS)
	})
})

