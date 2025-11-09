import { faker } from "@faker-js/faker"

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
	theme: themeId,
	chits: 10,
})

const orgStub = (themeId: string, leverage: number) => ({
	title: faker.company.name(),
	ask: faker.number.int(),
	theme: themeId,
	leverageFunds: leverage,
})

let orgs: string[] = []
let memberThemes: string[] = []

describe("Promises with rate limiting", function() {
	beforeEach(async function() {
		memberThemes = []
		orgs = []
		await MemberThemes.removeAsync({})
		await Members.removeAsync({})
		await Organizations.removeAsync({})
		await Themes.removeAsync({})

		const themeData = themeDataStub()
		const themeId = await ThemeMethods.create.call(themeData)
		const createdTheme = (await Themes.find({ _id: themeId }).fetchAsync())[0]

		const tasks: Array<Promise<unknown>> = []

		for(let i = 0; i < NUM_TEST_RECORDS; i++) {
			tasks.push(
				MemberMethods.upsert.call(memberStub(createdTheme._id)).then(memberTheme => {
					memberThemes.push(memberTheme)
				})
			)

			tasks.push(
				OrganizationMethods.create.call(
					orgStub(createdTheme._id, themeData.leverage / NUM_TEST_RECORDS)
				).then(orgId => {
					orgs.push(orgId)
				})
			)
		}

		await Promise.all(tasks)
	})
})

