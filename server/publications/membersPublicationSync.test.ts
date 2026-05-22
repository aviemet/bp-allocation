import { expect } from "chai"

import {
	applyMembersPublicationRefreshPlan,
	planMembersPublicationRefresh,
} from "/imports/server/publications/membersPublicationSync"

describe("planMembersPublicationRefresh", () => {
	it("uses added for members not yet published (avoids changed on unknown ids)", () => {
		const publishedMemberIds = new Set(["member-a"])
		const plan = planMembersPublicationRefresh(publishedMemberIds, ["member-a", "member-b"])

		expect(plan.changed).to.deep.equal(["member-a"])
		expect(plan.added).to.deep.equal(["member-b"])
		expect(plan.removed).to.deep.equal([])
	})

	it("uses changed only for members already in the subscription", () => {
		const publishedMemberIds = new Set(["member-a", "member-b"])
		const plan = planMembersPublicationRefresh(publishedMemberIds, ["member-a", "member-b"])

		expect(plan.changed).to.deep.equal(["member-a", "member-b"])
		expect(plan.added).to.deep.equal([])
		expect(plan.removed).to.deep.equal([])
	})

	it("emits removed when a member drops out of the refreshed set", () => {
		const publishedMemberIds = new Set(["member-a", "member-b"])
		const plan = planMembersPublicationRefresh(publishedMemberIds, ["member-b"])

		expect(plan.removed).to.deep.equal(["member-a"])
		expect(plan.changed).to.deep.equal(["member-b"])
		expect(plan.added).to.deep.equal([])
	})

	it("matches the bug scenario: refresh after a new member joins the theme", () => {
		const publishedAtSubscribe = new Set(["existing-member"])
		const afterMemberThemeCoordinatorUpdate = ["existing-member", "new-member-id"]

		const plan = planMembersPublicationRefresh(publishedAtSubscribe, afterMemberThemeCoordinatorUpdate)

		expect(plan.added).to.deep.equal(["new-member-id"])
		expect(plan.changed).to.deep.equal(["existing-member"])
		expect(plan.removed).to.deep.equal([])

		const naiveChangedOnly = afterMemberThemeCoordinatorUpdate.filter(
			memberId => !publishedAtSubscribe.has(memberId),
		)
		expect(naiveChangedOnly).to.deep.equal(["new-member-id"])
		expect(plan.added).to.include.members(naiveChangedOnly)
	})

	it("updates publishedMemberIds when applyMembersPublicationRefreshPlan runs", () => {
		const publishedMemberIds = new Set(["member-a"])
		const plan = planMembersPublicationRefresh(publishedMemberIds, ["member-b"])

		applyMembersPublicationRefreshPlan(publishedMemberIds, plan)

		expect([...publishedMemberIds]).to.deep.equal(["member-b"])
	})
})
