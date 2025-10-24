import { expect } from "chai"

import { faker } from "@faker-js/faker"
import { formatPhoneNumber } from "/imports/lib/utils"

import { ThemeMethods, MemberMethods, OrganizationMethods } from "/imports/api/methods"
import { Themes, Members, MemberThemes } from "/imports/api/db"
import { Organizations } from "../../../imports/api/db/Organizations"

const NUM_TEST_RECORDS = 5

const themeData = {
	title: faker.company.buzzNoun(),
	leverage: 1200000,
}

// Will get populated by before method
var theme
var orgs = []
var memberThemes = []

describe("Member Methods", async function() {

	beforeEach(async function(done) {
		try {
			// Create a test Theme record
			let themeId = await ThemeMethods.create.call(themeData)
			theme = await Themes.find({ _id: themeId }).fetch()[0]
			themeData._id = theme._id
			numTopOrgsDefault = theme.numTopOrgs

			for(let i = 0; i < NUM_TEST_RECORDS; i++) {
				// Add some associated test Member records
				const memberTheme = await MemberMethods.upsert.call({
					firstName: faker.person.firstName(),
					lastName: faker.person.lastName(),
					number: faker.number.int(),
					themeId: theme._id,
					amount: faker.number.int(),
					phone: faker.phone.number(),
				})
				memberThemes.push(memberTheme)

				// Add some associated test Organization records
				const orgId = await OrganizationMethods.create.call({
					title: faker.company.name(),
					ask: faker.number.int(),
					theme: theme._id,
					leverageFunds: themeData.leverage / NUM_TEST_RECORDS,
				})
				orgs.push(orgId) // Save list of org ids for later test
			}
		} catch(e) {
			console.error("Error: ", e)
		} finally {
			done()
		}
	})

	/**
	 * Create
	 */
	describe("Create", function() {

		it(`Should have ${NUM_TEST_RECORDS} member records`, () => {
			expect(Members.find({}).count()).to.equal(NUM_TEST_RECORDS)
			expect(MemberThemes.find({}).count()).to.equal(NUM_TEST_RECORDS)
		})

		it("Should derive extra fields", () => {
			const member = Members.find({}).fetch()[0]
			const initials = `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase()
			const code = `${initials}${member.number}`

			expect(member.initials).to.equal(initials)
			expect(member.code).to.equal(code)
		})

	})

	describe("Update", () => {
		it("Should update to new values", () => {
			const updates = {
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				number: faker.number.int(),
				phone: faker.phone.number(),
			}
			const member = Members.find({}).fetch()[0]
			MemberMethods.update.call({ id: member._id, data: updates })
			const newMember = Members.find({ _id: member._id }).fetch()[0]

			expect(newMember.firstName).to.equal(updates.firstName)
			expect(newMember.lastName).to.equal(updates.lastName)
			expect(newMember.number).to.equal(updates.number)
			expect(newMember.phone).to.equal(formatPhoneNumber(updates.phone))
		})
	})

	describe("Delete 1 member record", () => {
		it("Should reduce the number of members and memberThemes by 1", async() => {
			const member = Members.find({}).fetch()[0]
			await MemberMethods.remove.call(member._id)

			expect(Members.find({}).count()).to.equal(NUM_TEST_RECORDS - 1)
			expect(MemberThemes.find({}).count()).to.equal(NUM_TEST_RECORDS - 1)
		})
	})

	describe("Delete member from theme", () => {
		it("Should remove member from theme", async() => {
			const member = Members.find({}).fetch()[0]
			await MemberMethods.removeMemberFromTheme.call({ memberId: member._id, themeId: themeData._id })

			expect(Members.find({}).count()).to.equal(NUM_TEST_RECORDS)
			expect(MemberThemes.find({}).count()).to.equal(NUM_TEST_RECORDS - 1)
		})

		it("Should remove their pledges", async() => {
			const member = Members.find({}).fetch()[0]
			const orgs = Organizations.find({}).fetch()
			OrganizationMethods.pledge.call({ id: orgs[0]._id, amount: 1000, member: member._id })

			await MemberMethods.removeMemberFromTheme.call({ memberId: member._id, themeId: themeData._id })

			const org = Organizations.find({ _id: orgs[0]._id }).fetch()[0]

			expect(org.pledges.length).to.equal(0)
		})
	})

})
