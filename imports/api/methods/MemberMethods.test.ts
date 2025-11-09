import { faker } from "@faker-js/faker"
import { expect } from "chai"

import { formatPhoneNumber } from "/imports/lib/utils"

import { ThemeMethods, MemberMethods, OrganizationMethods } from "/imports/api/methods"
import { Themes, Members, MemberThemes } from "/imports/api/db"
import { Organizations } from "/imports/api/db"

const NUM_TEST_RECORDS = 5

let themeData: {
	_id?: string
	title: string
	leverage: number
}

let theme
let orgIds: string[] = []
let memberThemeIds: string[] = []
let memberIds: string[] = []

describe("Member Methods", function() {

	beforeEach(async function() {
		memberThemeIds = []
		memberIds = []
		orgIds = []

		themeData = {
			title: faker.company.buzzNoun(),
			leverage: 1200000,
		}

		const themeId = await ThemeMethods.create.callAsync(themeData)
		const createdTheme = (await Themes.find({ _id: themeId }).fetchAsync())[0]
		theme = createdTheme
		themeData._id = createdTheme._id

		for(let i = 0; i < NUM_TEST_RECORDS; i++) {
			const memberThemeId = await MemberMethods.upsert.callAsync({
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				number: faker.number.int(),
				theme: createdTheme._id,
				themeId: createdTheme._id,
				amount: faker.number.int(),
				phone: faker.phone.number(),
			})
			memberThemeIds.push(memberThemeId)
			const memberThemeDoc = await MemberThemes.findOneAsync({ _id: memberThemeId })
			if(memberThemeDoc) {
				memberIds.push(memberThemeDoc.member)
			}

			const { response: createdOrgId } = await OrganizationMethods.create.callAsync({
				title: faker.company.name(),
				ask: faker.number.int(),
				theme: createdTheme._id,
				leverageFunds: themeData.leverage / NUM_TEST_RECORDS,
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

		it(`Should have ${NUM_TEST_RECORDS} member records`, async function() {
			const memberThemeCount = await MemberThemes.find({ _id: { $in: memberThemeIds } }).countAsync()
			const memberCount = await Members.find({ _id: { $in: memberIds } }).countAsync()
			expect(memberCount).to.equal(NUM_TEST_RECORDS)
			expect(memberThemeCount).to.equal(NUM_TEST_RECORDS)
		})

		it("Should derive extra fields", async function() {
			const member = await Members.findOneAsync({ _id: memberIds[0] })
			if(!member) {
				throw new Error("Member not found")
			}
			const initials = `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase()
			const code = `${initials}${member.number}`

			expect(member.initials).to.equal(initials)
			expect(member.code).to.equal(code)
		})

	})

	describe("Update", () => {
		it("Should update to new values", async function() {
			const updates = {
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				number: faker.number.int(),
				phone: faker.phone.number(),
			}
			const member = await Members.findOneAsync({ _id: memberIds[0] })
			if(!member) {
				throw new Error("Member not found")
			}
			await MemberMethods.update.callAsync({ id: member._id, data: updates })
			const newMember = (await Members.find({ _id: member._id }).fetchAsync())[0]

			expect(newMember.firstName).to.equal(updates.firstName)
			expect(newMember.lastName).to.equal(updates.lastName)
			expect(newMember.number).to.equal(updates.number)
			expect(newMember.phone).to.equal(formatPhoneNumber(updates.phone))
		})
	})

	describe("Delete 1 member record", () => {
		it("Should reduce the number of members and memberThemes by 1", async function() {
			const member = await Members.findOneAsync({ _id: memberIds[0] })
			if(!member) {
				throw new Error("Member not found")
			}
			await MemberMethods.remove.callAsync(member._id)

			const memberCount = await Members.find({ _id: { $in: memberIds } }).countAsync()
			const memberThemeCount = await MemberThemes.find({ theme: themeData._id }).countAsync()

			expect(memberCount).to.equal(NUM_TEST_RECORDS - 1)
			expect(memberThemeCount).to.equal(NUM_TEST_RECORDS - 1)
		})
	})

	describe("Delete member from theme", () => {
		it("Should remove member from theme", async function() {
			const member = await Members.findOneAsync({ _id: memberIds[0] })
			if(!member) {
				throw new Error("Member not found")
			}
			await MemberMethods.removeMemberFromTheme.callAsync({ memberId: member._id, themeId: themeData._id })

			const memberCount = await Members.find({ _id: { $in: memberIds } }).countAsync()
			const memberThemeCount = await MemberThemes.find({ theme: themeData._id }).countAsync()

			expect(memberCount).to.equal(NUM_TEST_RECORDS)
			expect(memberThemeCount).to.equal(NUM_TEST_RECORDS - 1)
		})

		it("Should remove their pledges", async function() {
			const member = await Members.findOneAsync({ _id: memberIds[0] })
			if(!member) {
				throw new Error("Member not found")
			}
			const orgDocuments = await Organizations.find({ _id: { $in: orgIds } }).fetchAsync()
			await OrganizationMethods.pledge.callAsync({ id: orgDocuments[0]._id, amount: 1000, member: member._id })

			await MemberMethods.removeMemberFromTheme.callAsync({ memberId: member._id, themeId: themeData._id })

			const org = (await Organizations.find({ _id: orgDocuments[0]._id }).fetchAsync())[0]

			expect(org.pledges.length).to.equal(0)
		})
	})

})
