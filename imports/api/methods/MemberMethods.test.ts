import { faker } from "@faker-js/faker"
import { expect } from "chai"

import { formatPhoneNumber } from "/imports/lib/utils"

import { ThemeMethods, MemberMethods, OrganizationMethods } from "/imports/api/methods"
import { Themes, Members, MemberThemes } from "/imports/api/db"
import { Organizations } from "/imports/api/db"
import { resetDatabase } from "../../test-support/resetDatabase"

const NUM_TEST_RECORDS = 5

let themeData: {
	_id?: string
	title: string
	leverage: number
}

let orgIds: string[] = []
let memberThemeIds: string[] = []
let memberIds: string[] = []

describe("Member Methods", function() {

	beforeEach(async function() {
		await resetDatabase()
		memberThemeIds = []
		memberIds = []
		orgIds = []

		themeData = {
			title: (() => {
				let title = faker.company.buzzNoun()
				while(title.length < 3) {
					title = faker.company.buzzNoun()
				}
				return title
			})(),
			leverage: 1200000,
		}

		const themeId = await ThemeMethods.create.callAsync(themeData)
		if(!themeId) throw new Error("Failed to create theme")
		const createdTheme = (await Themes.find({ _id: themeId }).fetchAsync())[0]
		themeData._id = createdTheme._id

		for(let i = 0; i < NUM_TEST_RECORDS; i++) {
			const memberThemeId = await MemberMethods.upsert.callAsync({
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				number: faker.number.int(),
				theme: createdTheme._id,
				amount: faker.number.int(),
				phone: faker.phone.number(),
				chits: 10,
			})
			memberThemeIds.push(memberThemeId)
			const memberThemeDoc = await MemberThemes.findOneAsync({ _id: memberThemeId })
			if(memberThemeDoc?.member) {
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
			if(!themeData._id) throw new Error("Theme ID not found")
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

			if(!themeData._id) throw new Error("Theme ID not found")
			await MemberMethods.removeMemberFromTheme.callAsync({ memberId: member._id, themeId: themeData._id })

			const org = (await Organizations.find({ _id: orgDocuments[0]._id }).fetchAsync())[0]

			expect(org.pledges?.length).to.equal(0)
		})
	})

	describe("RemoveAllMembers", () => {
		it("Should remove every memberTheme association for the theme", async function() {
			if(!themeData._id) throw new Error("Theme ID not found")
			await MemberMethods.removeAllMembers.callAsync(themeData._id)
			const remaining = await MemberThemes.find({ theme: themeData._id }).countAsync()
			expect(remaining).to.equal(0)
		})

		it("Should pull every matching pledge from orgs in the theme", async function() {
			if(!themeData._id) throw new Error("Theme ID not found")
			const targetOrg = (await Organizations.find({ _id: orgIds[0] }).fetchAsync())[0]
			await OrganizationMethods.pledge.callAsync({ id: targetOrg._id, amount: 100, member: memberIds[0] })
			await OrganizationMethods.pledge.callAsync({ id: targetOrg._id, amount: 200, member: memberIds[1] })

			await MemberMethods.removeAllMembers.callAsync(themeData._id)

			const orgAfter = await Organizations.findOneAsync({ _id: targetOrg._id })
			expect(orgAfter?.pledges ?? []).to.have.length(0)
		})
	})

	describe("UpdateTheme", () => {
		it("Should set memberTheme fields like amount and chits", async function() {
			const memberThemeId = memberThemeIds[0]
			await MemberMethods.updateTheme.callAsync({ id: memberThemeId, data: { amount: 999, chits: 3 } })
			const updated = await MemberThemes.findOneAsync({ _id: memberThemeId })
			expect(updated?.amount).to.equal(999)
			expect(updated?.chits).to.equal(3)
		})
	})

	describe("FundVote", () => {
		it("Should push a new allocation when none exists for the org", async function() {
			if(!themeData._id) throw new Error("Theme ID not found")
			await MemberMethods.fundVote.callAsync({
				theme: themeData._id,
				member: memberIds[0],
				org: orgIds[0],
				amount: 75,
				voteSource: "mobile",
			})

			const memberTheme = await MemberThemes.findOneAsync({ theme: themeData._id, member: memberIds[0] })
			expect(memberTheme?.allocations).to.have.length(1)
			expect(memberTheme?.allocations?.[0]).to.include({ organization: orgIds[0], amount: 75, voteSource: "mobile" })
		})

		it("Should update an existing allocation rather than duplicating", async function() {
			if(!themeData._id) throw new Error("Theme ID not found")
			await MemberMethods.fundVote.callAsync({
				theme: themeData._id, member: memberIds[0], org: orgIds[0], amount: 50,
			})
			await MemberMethods.fundVote.callAsync({
				theme: themeData._id, member: memberIds[0], org: orgIds[0], amount: 125, voteSource: "kiosk",
			})

			const memberTheme = await MemberThemes.findOneAsync({ theme: themeData._id, member: memberIds[0] })
			expect(memberTheme?.allocations).to.have.length(1)
			expect(memberTheme?.allocations?.[0]).to.include({ organization: orgIds[0], amount: 125, voteSource: "kiosk" })
		})

		it("Should do nothing when there is no memberTheme to update", async function() {
			await MemberMethods.fundVote.callAsync({
				theme: faker.string.uuid(),
				member: faker.string.uuid(),
				org: orgIds[0],
				amount: 10,
			})
			const fakeCount = await MemberThemes.find({ theme: faker.string.uuid() }).countAsync()
			expect(fakeCount).to.equal(0)
		})
	})

	describe("ChitVote", () => {
		it("Should push a new chitVote when none exists for the org", async function() {
			if(!themeData._id) throw new Error("Theme ID not found")
			await MemberMethods.chitVote.callAsync({
				theme: themeData._id,
				member: memberIds[0],
				org: orgIds[0],
				votes: 3,
				voteSource: "mobile",
			})

			const memberTheme = await MemberThemes.findOneAsync({ theme: themeData._id, member: memberIds[0] })
			expect(memberTheme?.chitVotes).to.have.length(1)
			expect(memberTheme?.chitVotes?.[0]).to.include({ organization: orgIds[0], votes: 3, voteSource: "mobile" })
		})

		it("Should update an existing chitVote rather than duplicating", async function() {
			if(!themeData._id) throw new Error("Theme ID not found")
			await MemberMethods.chitVote.callAsync({
				theme: themeData._id, member: memberIds[0], org: orgIds[0], votes: 1,
			})
			await MemberMethods.chitVote.callAsync({
				theme: themeData._id, member: memberIds[0], org: orgIds[0], votes: 4, voteSource: "kiosk",
			})

			const memberTheme = await MemberThemes.findOneAsync({ theme: themeData._id, member: memberIds[0] })
			expect(memberTheme?.chitVotes).to.have.length(1)
			expect(memberTheme?.chitVotes?.[0]).to.include({ organization: orgIds[0], votes: 4, voteSource: "kiosk" })
		})
	})

	describe("ResetChitVotes", () => {
		it("Should clear the chitVotes array on the memberTheme", async function() {
			if(!themeData._id) throw new Error("Theme ID not found")
			await MemberMethods.chitVote.callAsync({
				theme: themeData._id, member: memberIds[0], org: orgIds[0], votes: 2,
			})
			await MemberMethods.chitVote.callAsync({
				theme: themeData._id, member: memberIds[0], org: orgIds[1], votes: 1,
			})

			const memberThemeId = memberThemeIds[0]
			await MemberMethods.resetChitVotes.callAsync(memberThemeId)
			const reset = await MemberThemes.findOneAsync({ _id: memberThemeId })
			expect(reset?.chitVotes ?? []).to.have.length(0)
		})
	})

	describe("ResetFundsVotes", () => {
		it("Should clear the allocations array on the memberTheme", async function() {
			if(!themeData._id) throw new Error("Theme ID not found")
			await MemberMethods.fundVote.callAsync({
				theme: themeData._id, member: memberIds[0], org: orgIds[0], amount: 50,
			})
			await MemberMethods.fundVote.callAsync({
				theme: themeData._id, member: memberIds[0], org: orgIds[1], amount: 25,
			})

			const memberThemeId = memberThemeIds[0]
			await MemberMethods.resetFundsVotes.callAsync(memberThemeId)
			const reset = await MemberThemes.findOneAsync({ _id: memberThemeId })
			expect(reset?.allocations ?? []).to.have.length(0)
		})
	})

})
