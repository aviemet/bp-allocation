import { faker } from "@faker-js/faker"
import { expect } from "chai"
import { ThemeMethods, OrganizationMethods } from "/imports/api/methods"
import { Themes, Organizations, ThemeData } from "/imports/api/db"
import { resetDatabase } from "../../tests/resetDatabase"

const themeData: { title: string, leverage: number, _id?: string } = {
	title: faker.company.buzzNoun(),
	leverage: 1200000,
}

let orgIds: string[] = []
let theme: ThemeData
let orgId: string
let numTopOrgsDefault: number

describe("Theme Methods", function() {

	before(async function() {
		resetDatabase()

		const themeId = await ThemeMethods.create.callAsync(themeData)
		if(!themeId) throw new Error("Failed to create theme")
		const createdTheme = (await Themes.find({ _id: themeId }).fetchAsync())[0]
		theme = createdTheme
		themeData._id = createdTheme._id
		numTopOrgsDefault = createdTheme.numTopOrgs

		for(let i = 0; i < 5; i++) {
			const { response: createdOrgId } = await OrganizationMethods.create.callAsync({
				title: faker.company.name(),
				ask: faker.number.int(),
				theme: createdTheme._id,
				leverageFunds: themeData.leverage / 5,
			})
			if(createdOrgId) {
				orgIds.push(createdOrgId)
			}
		}
	})

	/**
	 * Create
	 */
	describe("Create", function() {

		it("Should create a Theme", function() {
			expect(theme).to.not.be.undefined
		})

		it("Should create a nested PresentationSettings object", function() {
			expect(theme).to.have.property("presentationSettings")
		})

	})

	/**
	 * Top Org Toggle
	 */
	describe("TopOrgToggle", function() {
		it("Should add an org id to the set of topOrgsManual", async function() {
			orgId = orgIds[ 0 ]

			await ThemeMethods.topOrgToggle.callAsync({ theme_id: theme._id, org_id: orgId })
			theme = (await Themes.find({ _id: theme._id }).fetchAsync())[0]
			expect(theme.topOrgsManual).to.include(orgId)
		})

		it("Should remove an org id from the set of topOrgsManual", async function() {
			await ThemeMethods.topOrgToggle.callAsync({ theme_id: theme._id, org_id: orgId })
			theme = (await Themes.find({ _id: theme._id }).fetchAsync())[0]
			expect(theme.topOrgsManual).to.not.include(orgId)
		})

	})

	/**
	 * Save Org
	 */
	describe("SaveOrg", function() {

		it("Should add a save record to the theme", async function() {
			orgId = orgIds[ faker.number.int({ min: 0, max: orgIds.length - 1 }) ]
			const amount = faker.number.int()
			await ThemeMethods.saveOrg.callAsync({
				id: orgId,
				amount: amount,
			})
			theme = (await Themes.find({ _id: theme._id }).fetchAsync())[0]

			expect(theme.saves?.[0]).to.include({ org: orgId, amount: amount })
		})

		it("Should increment numTopOrgs", function() {
			expect(theme.numTopOrgs).to.equal(numTopOrgsDefault + 1)
		})

		it("Should add orgId to topOrgsManual", function() {
			expect(theme.topOrgsManual).to.include(orgId)
		})

	})

	/**
	 * Un Save Org
	 */
	describe("UnSaveOrg", function() {

		it("Should remove a save record from the theme", async function() {
			await ThemeMethods.unSaveOrg.callAsync({
				theme_id: theme._id,
				org_id: orgId,
			})
			theme = (await Themes.find({ _id: theme._id }).fetchAsync())[0]

			expect(theme.saves).to.be.empty
		})

		it("Should increment numTopOrgs", function() {
			expect(theme.numTopOrgs).to.equal(numTopOrgsDefault)
		})

		it("Should add orgId to topOrgsManual", function() {
			expect(theme.topOrgsManual).to.not.include(orgId)
		})

	})

	/**
	 * Save Leverage Spread
	 */
	describe("SaveLeverageSpread", function() {

		it("Should distribute the leverage amounts", async function() {
			const leverage = themeData.leverage / 5
			const orgs = orgIds.map(id => {
				return {
					_id: id,
					leverageFunds: leverage,
				}
			})

			await ThemeMethods.saveLeverageSpread.callAsync(orgs)

			const orgRecords = await Organizations.find({ _id: { $in: orgIds } }).fetchAsync()
			orgRecords.forEach(org => {
				expect(org.leverageFunds).to.equal(leverage)
			})

		})

	})

	/**
	 * Reset Leverage Spread
	 */
	describe("ResetLeverage", function() {
		it("Should set leverageFunds back to 0 for all orgs in theme", async function() {
			await ThemeMethods.resetLeverage.callAsync(theme._id)
			theme = (await Themes.find({ _id: theme._id }).fetchAsync())[0]

			const orgRecords = await Organizations.find({ _id: { $in: orgIds } }).fetchAsync()
			orgRecords.forEach(org => {
				expect(org.leverageFunds).to.equal(0)
			})
		})
	})

	/**
	 * Update
	 */
	describe("Update", function() {

		it("Should update specified fields on the object", async function() {
			const question = faker.lorem.words(3)
			await ThemeMethods.update.callAsync({ id: theme._id, data: {
				question: question,
			} })
			theme = (await Themes.find({ _id: theme._id }).fetchAsync())[0]
			expect(theme.question).to.equal(question)
		})

	})

	describe("Remove", function() {

	})
})
