import { faker } from "@faker-js/faker"
import { expect } from "chai"
import { Random } from "meteor/random"

import { ThemeMethods, OrganizationMethods, MemberMethods } from "/imports/api/methods"
import { Themes, Organizations, MemberThemes, ThemeData } from "/imports/api/db"
import { PledgeAnimationQueue } from "/imports/api/db/PledgeAnimationQueue"
import { resetDatabase } from "../../test-support/resetDatabase"

const themeData: { title: string, leverage: number, _id?: string } = {
	title: (() => {
		let title = faker.company.buzzNoun()
		while(title.length < 3) {
			title = faker.company.buzzNoun()
		}
		return title
	})(),
	leverage: 1200000,
}

let orgIds: string[] = []
let theme: ThemeData
let orgId: string
let numTopOrgsDefault: number

describe("Theme Methods", function() {

	before(async function() {
		await resetDatabase()

		const themeId = await ThemeMethods.create.callAsync(themeData)
		if(!themeId) throw new Error("Failed to create theme")
		const createdTheme = await Themes.findOneAsync({ _id: themeId })
		if(!createdTheme) throw new Error("Failed to fetch created theme")
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

			await ThemeMethods.saveLeverageSpread.callAsync({
				orgs,
				themeId: theme._id,
			})

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

	/**
	 * ResetAllOrgFunds
	 */
	describe("ResetAllOrgFunds", function() {
		it("Should zero out funding state across orgs, member themes, the theme, and the pledge animation queue", async function() {
			const targetOrgId = orgIds[0]

			await OrganizationMethods.update.callAsync({
				id: targetOrgId,
				data: { amountFromVotes: 500, topOff: 250, leverageFunds: 1000 },
			})
			await OrganizationMethods.pledge.callAsync({ id: targetOrgId, amount: 100, member: Random.id() })

			const memberThemeId = await MemberMethods.upsert.callAsync({
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				number: faker.number.int({ min: 1, max: 999 }),
				theme: theme._id,
				amount: 200,
				chits: 5,
			})
			const memberTheme = await MemberThemes.findOneAsync({ _id: memberThemeId })
			if(!memberTheme?.member) throw new Error("MemberTheme with member id not found")
			const memberId = memberTheme.member
			await MemberMethods.fundVote.callAsync({
				theme: theme._id,
				member: memberId,
				org: targetOrgId,
				amount: 50,
			})
			await MemberMethods.chitVote.callAsync({
				theme: theme._id,
				member: memberId,
				org: targetOrgId,
				votes: 2,
			})

			await PledgeAnimationQueue.insertAsync({
				themeId: theme._id,
				pledgeId: Random.id(),
				orgId: targetOrgId,
				orgTitle: "Animated Org",
				timestamp: new Date(),
				processed: false,
			})

			await Themes.updateAsync({ _id: theme._id }, { $set: { finalLeverageDistributed: true } })

			const result = await ThemeMethods.resetAllOrgFunds.callAsync(theme._id)

			expect(result.organizationsUpdated).to.be.greaterThan(0)
			expect(result.memberThemesUpdated).to.be.greaterThan(0)

			const orgsAfter = await Organizations.find({ _id: { $in: orgIds } }).fetchAsync()
			orgsAfter.forEach(org => {
				expect(org.amountFromVotes).to.equal(0)
				expect(org.topOff).to.equal(0)
				expect(org.leverageFunds).to.equal(0)
				expect(org.pledges ?? []).to.have.length(0)
			})

			const memberThemesAfter = await MemberThemes.find({ theme: theme._id }).fetchAsync()
			memberThemesAfter.forEach(record => {
				expect(record.allocations ?? []).to.have.length(0)
				expect(record.chitVotes ?? []).to.have.length(0)
			})

			const themeAfter = await Themes.findOneAsync({ _id: theme._id })
			expect(themeAfter?.finalLeverageDistributed).to.equal(false)

			const queueRemaining = await PledgeAnimationQueue.find({ themeId: theme._id }).countAsync()
			expect(queueRemaining).to.equal(0)
		})

		it("Should return zeroed counts when the theme does not exist", async function() {
			const result = await ThemeMethods.resetAllOrgFunds.callAsync(Random.id())
			expect(result).to.deep.equal({ organizationsUpdated: 0, memberThemesUpdated: 0 })
		})
	})

	/**
	 * ResetMessageStatus
	 */
	describe("ResetMessageStatus", function() {
		it("Should clear the messagesStatus array on the theme", async function() {
			await Themes.updateAsync({ _id: theme._id }, {
				$set: { messagesStatus: [{ messageId: Random.id(), sending: false, sent: true, error: false }] },
			})
			const themeWithStatus = await Themes.findOneAsync({ _id: theme._id })
			expect(themeWithStatus?.messagesStatus ?? []).to.have.length(1)

			await ThemeMethods.resetMessageStatus.callAsync(theme._id)
			const themeReset = await Themes.findOneAsync({ _id: theme._id })
			expect(themeReset?.messagesStatus ?? []).to.have.length(0)
		})
	})

	/**
	 * Remove
	 */
	describe("Remove", function() {
		it("Should remove the theme and cascade delete its organizations", async function() {
			expect(await Themes.findOneAsync({ _id: theme._id })).to.exist

			await ThemeMethods.remove.callAsync(theme._id)

			expect(await Themes.findOneAsync({ _id: theme._id })).to.not.exist
			const remainingOrgs = await Organizations.find({ _id: { $in: orgIds } }).countAsync()
			expect(remainingOrgs).to.equal(0)
		})
	})
})
