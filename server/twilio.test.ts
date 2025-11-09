import { faker } from "@faker-js/faker"
import { expect } from "chai"
import { formatPhoneNumber } from "/imports/lib/utils"

import { ThemeMethods, MemberMethods, OrganizationMethods } from "/imports/api/methods"
import { Themes, Members, MemberThemes, Organizations } from "/imports/api/db"

const NUM_TEST_RECORDS = 500

const themeDataStub = () => ({
	title: faker.company.buzzNoun(),
	leverage: 1200000,
})

const memberStub = (themeId: string) => ({
	firstName: faker.person.firstName(),
	lastName: faker.person.lastName(),
	number: faker.number.int(),
	amount: faker.number.int(),
	phone: faker.phone.number(),
	themeId,
})

const orgStub = (themeId: string) => ({
	title: faker.company.name(),
	ask: faker.number.int(),
	theme: themeId,
	leverageFunds: faker.number.int(),
})

let orgs = []
let memberThemes = []

describe("Promises with rate limiting", function() {
	beforeEach(async function() {
		memberThemes = []
		orgs = []
		await MemberThemes.removeAsync({})
		await Members.removeAsync({})
		await Organizations.removeAsync({})
		await Themes.removeAsync({})

		const themeId = await ThemeMethods.create.call(themeDataStub())
		const createdTheme = (await Themes.find({ _id: themeId }).fetchAsync())[0]
		theme = createdTheme

		const tasks: Array<Promise<unknown>> = []

		for(let i = 0; i < NUM_TEST_RECORDS; i++) {
			tasks.push(
				MemberMethods.upsert.call(memberStub(createdTheme._id)).then(memberTheme => {
					memberThemes.push(memberTheme)
				})
			)

			tasks.push(
				OrganizationMethods.create.call({
					...orgStub(createdTheme._id),
					leverageFunds: createdTheme.leverage / NUM_TEST_RECORDS,
				}).then(orgId => {
					orgs.push(orgId)
				})
			)
		}

		await Promise.all(tasks)
	})
})

